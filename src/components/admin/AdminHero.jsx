import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash, Save, MessageCircle, MapPin, CreditCard, Building, Clock, Layout, ZoomIn, ZoomOut, Maximize, Star, Video, Phone } from 'lucide-react';
import { polyfill } from "mobile-drag-drop";
import "mobile-drag-drop/default.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from './AdminHero.module.css';
import heroStyles from '../Hero.module.css';

// Habilitar Drag & Drop en dispositivos móviles manteniendo presionado 1 segundo
polyfill({
  holdToDrag: 1000,
});

// Requisito para navegadores móviles modernos (iOS Safari, Chrome Android)
// Permite que el polyfill pueda detener el scroll nativo al iniciar el arrastre
window.addEventListener('touchmove', function () { }, { passive: false });

const emptyForm = {
  badge: '',
  badgeClass: 'badgeCyan',
  titlePrimary: '',
  titleSecondary: '',
  titleHighlight: '',
  description: '',
  image: '',
  ctaText: 'VER PRODUCTOS',
  ctaAction: 'catalog',
  whatsappBadge: true,
  detailInfoAddress: '',
  detailInfoHours: '',
  order: 1,
  overlayOpacity: 100,
};

export default function AdminHero({ baseUrl, token }) {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [draggedScreenId, setDraggedScreenId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const loadScreens = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/api/hero`);
      if (!response.ok) {
        throw new Error('Error al cargar pantallas');
      }
      const data = await response.json();
      setScreens(data);
    } catch (err) {
      setError(err.message || 'Error al cargar pantallas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreens();
  }, []);

  const selectScreen = (screen) => {
    if (selectedId === screen._id) {
      setSelectedId(null);
      setForm(emptyForm);
      return;
    }

    setSelectedId(screen._id);
    setForm({
      badge: screen.badge || '',
      badgeClass: screen.badgeClass || 'badgeCyan',
      titlePrimary: screen.titlePrimary || '',
      titleSecondary: screen.titleSecondary || '',
      titleHighlight: screen.titleHighlight || '',
      description: screen.description || '',
      image: screen.image || '',
      ctaText: screen.ctaText || '',
      ctaAction: screen.ctaAction || 'catalog',
      whatsappBadge: Boolean(screen.whatsappBadge),
      detailInfoAddress: screen.detailInfo?.address || '',
      detailInfoHours: screen.detailInfo?.hours || '',
      order: screen.order || 1,
      overlayOpacity: screen.overlayOpacity !== undefined ? Number(screen.overlayOpacity) : 100,
    });
  };

  const handleAddSlide = () => {
    const maxOrder = screens.length > 0 ? Math.max(...screens.map(s => s.order)) : 0;
    const newSlide = {
      _id: `new_${Date.now()}`,
      ...emptyForm,
      order: maxOrder + 1,
    };
    setScreens([...screens, newSlide]);
    selectScreen(newSlide);
  };

  const toPayload = (f) => ({
    badge: f.badge,
    badgeClass: f.badgeClass,
    titlePrimary: f.titlePrimary,
    titleSecondary: f.titleSecondary,
    titleHighlight: f.titleHighlight,
    description: f.description,
    image: f.image,
    ctaText: f.ctaText,
    ctaAction: f.ctaAction,
    whatsappBadge: Boolean(f.whatsappBadge),
    detailInfo: f.detailInfoAddress || f.detailInfoHours ? {
      address: f.detailInfoAddress,
      hours: f.detailInfoHours
    } : null,
    order: Number(f.order),
    overlayOpacity: Number(f.overlayOpacity),
  });

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const payload = toPayload(form);
      const isNew = selectedId.toString().startsWith('new_');
      const url = isNew ? `${baseUrl}/api/admin/hero` : `${baseUrl}/api/admin/hero/${selectedId}`;
      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar');
      }
      showToast('Pantalla guardada correctamente');

      // Reload and keep selection
      const res = await fetch(`${baseUrl}/api/hero`);
      const newScreens = await res.json();
      setScreens(newScreens);

      if (isNew) {
        // Encontrar el último guardado o buscar por order si se quiere ser más preciso
        const savedSlide = newScreens.find(s => s.order === payload.order && s.titlePrimary === payload.titlePrimary) || newScreens[newScreens.length - 1];
        if (savedSlide) {
          setSelectedId(savedSlide._id);
        }
      }
    } catch (err) {
      showToast(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const isNew = selectedId.toString().startsWith('new_');

    if (isNew) {
      setScreens(screens.filter(s => s._id !== selectedId));
      setSelectedId(null);
      setShowDeleteModal(false);
      showToast('Pantalla eliminada');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/admin/hero/${selectedId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      showToast('Pantalla eliminada');
      setScreens(screens.filter(s => s._id !== selectedId));
      setSelectedId(null);
      setShowDeleteModal(false);
    } catch (err) {
      showToast(err.message || 'Error al eliminar');
      setShowDeleteModal(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showToast('Subiendo imagen...');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${baseUrl}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al subir');

      const imageUrl = data.imageUrl;
      setForm((prev) => ({ ...prev, image: imageUrl }));

      // Actualizar localmente el thumbnail
      setScreens(prev => prev.map(s => s._id === selectedId ? { ...s, image: imageUrl } : s));
      showToast('Imagen lista');
    } catch (err) {
      showToast(err.message || 'Error al subir');
    }
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Si cambia order o image, actualizar lista local para thumbnails
    if (key === 'image' || key === 'order' || key === 'titlePrimary') {
      setScreens(prev => prev.map(s => s._id === selectedId ? { ...s, [key]: value } : s));
    }
  };

  const handleImageDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleImageDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleImageUpload({ target: { files: [file] } });
    }
  };

  const handleDragStart = (e, screenId) => {
    setDraggedScreenId(screenId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the drag image from changing
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedScreenId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetScreen) => {
    e.preventDefault();
    if (!draggedScreenId || draggedScreenId === targetScreen._id) return;

    const currentScreens = [...screens].sort((a, b) => a.order - b.order);
    const draggedIdx = currentScreens.findIndex(s => s._id === draggedScreenId);
    const targetIdx = currentScreens.findIndex(s => s._id === targetScreen._id);

    const draggedScreen = currentScreens.splice(draggedIdx, 1)[0];
    currentScreens.splice(targetIdx, 0, draggedScreen);

    // Recalcular el orden
    const updatedScreens = currentScreens.map((s, idx) => ({ ...s, order: idx + 1 }));
    setScreens(updatedScreens);

    // Si la pantalla seleccionada actualmente cambió de orden, actualizamos el form
    const newSelected = updatedScreens.find(s => s._id === selectedId);
    if (newSelected && newSelected.order !== form.order) {
      setForm(prev => ({ ...prev, order: newSelected.order }));
    }

    // Persistir el orden en el backend
    const promises = updatedScreens.map(s => {
      if (!s._id.toString().startsWith('new_')) {
        return fetch(`${baseUrl}/api/admin/hero/${s._id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ order: s.order })
        });
      }
      return Promise.resolve();
    });

    try {
      showToast('Guardando orden...');
      await Promise.all(promises);
      showToast('Orden guardado correctamente');
    } catch (err) {
      showToast('Error al guardar el nuevo orden');
    }
  };

  const colorOptions = [
    { value: 'badgeCyan', label: 'Cyan', color: '#0891b2', desc: 'Tecnología' },
    { value: 'badgeEmerald', label: 'Esmeralda', color: '#10b981', desc: 'Novedad' },
    { value: 'badgeAmber', label: 'Ámbar', color: '#f59e0b', desc: 'Envíos' },
    { value: 'badgeIndigo', label: 'Índigo', color: '#6366f1', desc: 'Pagos' },
  ];

  const actionOptions = [
    { value: 'catalog', label: 'Catálogo', icon: <Layout size={16} /> },
    { value: 'featured', label: 'Destacados', icon: <Star size={16} /> },
    { value: 'videos', label: 'Videos', icon: <Video size={16} /> },
    { value: 'contact', label: 'Contactos', icon: <Phone size={16} /> },
  ];

  const renderPreview = () => (
    <div className={heroStyles.slide} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', padding: 0 }}>
      <div className={heroStyles.slideBackground}>
        <img
          src={form.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop'}
          alt=""
          className={heroStyles.slideImage}
        />
        <div className={heroStyles.slidePattern}></div>
        <div className={heroStyles.slideGradientBottom} style={{ opacity: form.overlayOpacity !== undefined ? form.overlayOpacity / 100 : 1 }}></div>
        <div className={heroStyles.slideGradientRight} style={{ opacity: form.overlayOpacity !== undefined ? form.overlayOpacity / 100 : 1 }}></div>
      </div>

      <div className={heroStyles.slideContent} style={{ padding: 'clamp(2rem, 5vw, 4rem)', margin: 0, justifyContent: 'center' }}>
        <div className={`${heroStyles.badge} ${heroStyles[form.badgeClass] || heroStyles.badgeCyan}`} style={{ alignSelf: 'flex-start' }}>
          <span className={heroStyles.badgeDot}></span>
          {form.badge || 'Etiqueta'}
        </div>
        <h2 className={heroStyles.title} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {form.titlePrimary} <br />
          {form.titleSecondary} <span className={heroStyles.titleHighlight}>{form.titleHighlight}</span>
        </h2>
        <p className={heroStyles.description} style={{ maxWidth: '600px' }}>
          {form.description || 'Descripción corta de la promoción o servicio...'}
        </p>

        {(form.detailInfoAddress || form.detailInfoHours) && (
          <div className={heroStyles.infoBox}>
            {form.detailInfoAddress && (
              <div className={heroStyles.infoItem}>
                {Number(form.order) === 4 ? <CreditCard className={heroStyles.infoIconIndigo} /> : <MapPin className={heroStyles.infoIconAccent} />}
                <div>
                  <p className={heroStyles.infoLabel}>{Number(form.order) === 4 ? "MERCADO PAGO" : "DIRECCIÓN"}</p>
                  <p className={heroStyles.infoValue}>{form.detailInfoAddress}</p>
                </div>
              </div>
            )}
            {form.detailInfoHours && (
              <div className={`${heroStyles.infoItem} ${heroStyles.infoItemBorder}`}>
                {Number(form.order) === 4 ? <Building className={heroStyles.infoIconIndigo} /> : <Clock className={heroStyles.infoIconAccent} />}
                <div>
                  <p className={heroStyles.infoLabel}>{Number(form.order) === 4 ? "TRANSFERENCIAS" : "HORARIOS"}</p>
                  <p className={heroStyles.infoValue}>{form.detailInfoHours}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={heroStyles.actions}>
          <button className={heroStyles.primaryButton}>
            {form.ctaText || 'VER PRODUCTOS'}
          </button>
          {form.whatsappBadge && (
            <button className={heroStyles.secondaryButton}>
              <MessageCircle size={16} className={heroStyles.whatsappIcon} />
              PEDIDOS WHATSAPP
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.workspace}>
      {notice && <div className={styles.toast}>{notice}</div>}

      {/* SIDEBAR: Slide List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Pantallas</h3>
          <button className={styles.addBtn} onClick={handleAddSlide}>
            <Plus size={16} /> Añadir
          </button>
        </div>
        <div className={styles.slideList}>
          {screens.sort((a, b) => a.order - b.order).map(screen => (
            <div
              key={screen._id}
              className={`${styles.slideThumbnail} ${selectedId === screen._id ? styles.active : ''}`}
              onClick={() => selectScreen(screen)}
              draggable
              onDragStart={(e) => handleDragStart(e, screen._id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, screen)}
              style={{ cursor: 'grab' }}
            >
              <img src={screen.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop'} alt="Thumbnail" />
              <div className={styles.orderBadge}>{screen.order}</div>
              <div className={styles.thumbnailLabel}>
                {screen.titlePrimary || 'Nueva Pantalla'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CANVAS AREA: Live Preview */}
      <div className={styles.canvasArea} ref={(node) => {
        if (node && !node.dataset.scaleSet) {
          node.dataset.scaleSet = 'true';
        }
      }}>
        {selectedId ? (
          <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <TransformWrapper
              initialScale={window.innerWidth <= 480 ? 0.26 : window.innerWidth <= 600 ? 0.33 : window.innerWidth <= 768 ? 0.41 : window.innerWidth <= 900 ? 0.53 : window.innerWidth <= 1024 ? 0.62 : window.innerWidth <= 1200 ? 0.4 : window.innerWidth <= 1366 ? 0.5 : window.innerWidth <= 1600 ? 0.6 : 0.8}
              minScale={0.1}
              maxScale={3}
              centerOnInit={true}
              limitToBounds={false}
              wheel={{ step: 0.002 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div style={{ width: '100%', height: '100%' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '0.5rem', backdropFilter: 'blur(4px)' }}>
                    <button onClick={() => zoomIn()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><ZoomIn size={18} /></button>
                    <button onClick={() => zoomOut()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><ZoomOut size={18} /></button>
                    <button onClick={() => resetTransform()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Maximize size={18} /></button>
                  </div>
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div style={{ width: '1400px', height: '800px', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#000' }}>
                      {renderPreview()}
                    </div>
                  </TransformComponent>
                </div>
              )}
            </TransformWrapper>
          </div>
        ) : (
          <div className={styles.emptyCanvas}>
            <Layout size={48} className={styles.emptyIcon} />
            Selecciona o crea una pantalla para editar
          </div>
        )}
      </div>

      {/* PROPERTIES PANEL: Form */}
      {selectedId && (
        <div className={styles.propertiesPanel}>
          <div className={styles.panelHeader}>
            <h3>Propiedades</h3>
            <button className={styles.deleteBtn} onClick={handleDelete} title="Eliminar Pantalla">
              <Trash size={16} />
            </button>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>General</span>
              <div className={styles.formGroup}>
                <label>Orden de aparición</label>
                <input type="number" className={styles.input} value={form.order} onChange={e => updateForm('order', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Fondo (Imagen)</label>
                <div
                  className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
                  onDragEnter={handleImageDragEnter}
                  onDragLeave={handleImageDragLeave}
                  onDragOver={handleImageDragOver}
                  onDrop={handleImageDrop}
                >
                  <p>Arrastra una imagen aquí o haz clic para subir</p>
                  <div className={styles.imageUploadGroup} style={{ marginTop: '1rem' }}>
                    <input className={styles.input} value={form.image} onChange={e => updateForm('image', e.target.value)} placeholder="URL de la imagen" style={{ flex: 1 }} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="heroImageUpload" />
                    <label htmlFor="heroImageUpload" className={styles.uploadBtn}>Subir</label>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Opacidad del Degradado (Fondo Oscuro): {form.overlayOpacity !== undefined ? form.overlayOpacity : 100}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.overlayOpacity !== undefined ? form.overlayOpacity : 100}
                  onChange={e => updateForm('overlayOpacity', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>Insignia Superior</span>
              <div className={styles.formGroup}>
                <label>Texto de la etiqueta</label>
                <input className={styles.input} value={form.badge} onChange={e => updateForm('badge', e.target.value)} placeholder="Ej: Catálogo Digital" />
              </div>
              <div className={styles.formGroup}>
                <label>Color</label>
                <div className={styles.colorPicker}>
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.colorOption} ${form.badgeClass === opt.value ? styles.colorOptionActive : ''}`}
                      onClick={() => updateForm('badgeClass', opt.value)}
                    >
                      <span className={styles.colorDot} style={{ backgroundColor: opt.color, color: opt.color }}></span>
                      <div className={styles.colorText}>
                        <span className={styles.colorName}>{opt.label}</span>
                        <span className={styles.colorDesc}>{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>Textos Principales</span>
              <div className={styles.formGroup}>
                <label>Título 1</label>
                <input className={styles.input} value={form.titlePrimary} onChange={e => updateForm('titlePrimary', e.target.value)} placeholder="Ej: TECNOLOGÍA LED" />
                <span className={styles.helperText}>Primera línea del título principal.</span>
              </div>
              <div className={styles.formGroup}>
                <label>Título 2</label>
                <input className={styles.input} value={form.titleSecondary} onChange={e => updateForm('titleSecondary', e.target.value)} placeholder="Ej: Y" />
                <span className={styles.helperText}>Segunda línea, texto normal.</span>
              </div>
              <div className={styles.formGroup}>
                <label>Palabra Resaltada</label>
                <input className={styles.input} value={form.titleHighlight} onChange={e => updateForm('titleHighlight', e.target.value)} placeholder="Ej: SUMINISTROS" />
                <span className={styles.helperText}>Esta palabra se mostrará en color de acento.</span>
              </div>
              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea className={styles.textarea} value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Breve texto introductorio..." />
                <span className={styles.helperText}>Aparece debajo del título principal.</span>
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>Caja de Información Adicional</span>
              <div className={styles.formGroup}>
                <label>Detalle 1 (Ej: Dirección)</label>
                <input className={styles.input} value={form.detailInfoAddress} onChange={e => updateForm('detailInfoAddress', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Detalle 2 (Ej: Horarios)</label>
                <input className={styles.input} value={form.detailInfoHours} onChange={e => updateForm('detailInfoHours', e.target.value)} />
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>Botones de Acción (CTA)</span>
              <div className={styles.formGroup}>
                <label>Texto del Botón Principal</label>
                <input className={styles.input} value={form.ctaText} onChange={e => updateForm('ctaText', e.target.value)} placeholder="Ej: VER PRODUCTOS" />
              </div>
              <div className={styles.formGroup}>
                <label>Acción del Botón</label>
                <div className={styles.actionPicker}>
                  {actionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.actionOption} ${form.ctaAction === opt.value ? styles.actionOptionActive : ''}`}
                      onClick={() => {
                        updateForm('ctaAction', opt.value);
                        const defaultTexts = {
                          catalog: 'VER PRODUCTOS',
                          featured: 'VER DESTACADOS',
                          videos: 'VER VIDEOS',
                          contact: 'CONTACTANOS'
                        };
                        updateForm('ctaText', defaultTexts[opt.value]);
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.toggleContainer} onClick={() => updateForm('whatsappBadge', !form.whatsappBadge)}>
                <div className={styles.toggleLabel}>
                  <span className={styles.toggleTitle}>Botón de WhatsApp</span>
                  <span className={styles.toggleDesc}>Muestra un botón secundario para pedidos</span>
                </div>
                <div className={`${styles.toggleSwitch} ${form.whatsappBadge ? styles.active : ''}`}></div>
              </div>
            </div>
          </div>

          <div className={styles.panelFooter}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar esta pantalla de forma permanente?
              Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.danger} onClick={confirmDelete}>
                Eliminar
              </button>
              <button type="button" className={styles.secondary} onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
