import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash, Star } from 'lucide-react';
import Filters from '../Filters.jsx';
import styles from './AdminProducts.module.css';

const BASE_CATEGORIES = ['semáforos', 'luminarias', 'cartelería vial'];

const emptyForm = {
  sku: '',
  nombre: '',
  descripcion: '',
  categoria: BASE_CATEGORIES[0],
  moneda: 'ARS',
  imagen: '',
  imagenes: [],
  destacado: false,
  id_catalogo: '',
  tamano_imagen: 'default',
  upload_mode: 'upload',
};

const buildSkuFromName = (name) => {
  const normalized = (name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return normalized
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
};

const getNextCatalogId = (items) => {
  const ids = (items || [])
    .map((item) => Number(item.id_catalogo))
    .filter((value) => Number.isFinite(value));

  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
};

const formatImageUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=))([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return trimmed;
};

export default function AdminProducts({ baseUrl, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState(emptyForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSku, setEditingSku] = useState('');
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [dragActive, setDragActive] = useState(false);
  const [draggedImgIdx, setDraggedImgIdx] = useState(null);
  const [urlInputEdit, setUrlInputEdit] = useState('');
  const [urlInputCreate, setUrlInputCreate] = useState('');

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const resetNotice = () => setNotice('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico`,
        { headers }
      );
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (isCreateOpen || editingSku || deleteTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateOpen, editingSku, deleteTarget]);

  const toPayload = (form) => {
    const idCatalogo = form.id_catalogo === '' ? undefined : Number(form.id_catalogo);

    return {
      sku: form.sku.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      moneda: form.moneda.trim() || 'ARS',
      imagen: form.imagen.trim(),
      imagenes: form.imagenes || [],
      destacado: Boolean(form.destacado),
      id_catalogo: idCatalogo,
      tamano_imagen: form.tamano_imagen || 'default',
    };
  };

  const handleCreate = async (event) => {
    event?.preventDefault();
    resetNotice();
    try {
      const catalogId = Number(createForm.id_catalogo);
      const hasDuplicateCatalogId = products.some(
        (product) => Number(product.id_catalogo) === catalogId
      );

      if (!Number.isFinite(catalogId)) {
        setNotice('El ID Catalogo es obligatorio.');
        return;
      }

      if (hasDuplicateCatalogId) {
        setNotice('El ID Catalogo ya existe en otro producto.');
        return;
      }

      const payload = toPayload(createForm);
      if (!payload.sku) {
        setNotice('El SKU es obligatorio.');
        return;
      }
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el producto');
      }
      setCreateForm(emptyForm);
      setNotice('Producto creado.');
      setIsCreateOpen(false);
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al crear el producto');
    }
  };

  const openCreate = () => {
    resetNotice();
    const nextCatalogId = getNextCatalogId(products);
    setCreateForm((prev) => ({
      ...emptyForm,
      id_catalogo: nextCatalogId,
      sku: prev?.sku || '',
    }));
    setEditingSku('');
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
  };

  const startEdit = (product) => {
    resetNotice();
    setEditingSku(product.sku);
    setEditForm({
      sku: product.sku || '',
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      categoria: product.categoria || BASE_CATEGORIES[0],
      moneda: product.moneda || 'ARS',
      imagen: product.imagen || '',
      imagenes: product.imagenes || [],
      destacado: Boolean(product.destacado),
      id_catalogo: product.id_catalogo ?? '',
      tamano_imagen: product.tamano_imagen || 'default',
      upload_mode: 'upload',
    });
  };

  const cancelEdit = () => {
    setEditingSku('');
    setEditForm(emptyForm);
  };

  const handleUpdate = async () => {
    resetNotice();
    try {
      const payload = toPayload(editForm);
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico/${editingSku}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }
      setNotice('Producto actualizado.');
      setEditingSku('');
      setEditForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al actualizar');
    }
  };

  const confirmDelete = (product) => {
    resetNotice();
    setDeleteTarget(product);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.sku) return;
    resetNotice();

    try {
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico/${deleteTarget.sku}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      setNotice('Producto eliminado.');
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al eliminar');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, isEditForm) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const pseudoEvent = { target: { files: e.dataTransfer.files } };
      handleImageUpload(pseudoEvent, isEditForm);
    }
  };

  const handleImageUpload = async (event, isEditForm) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setNotice('Subiendo imagen(es)...');

    try {
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const response = await fetch(`${baseUrl}/api/admin/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al subir imagen');
        }
        urls.push(data.imageUrl.startsWith('/') ? `${baseUrl}${data.imageUrl}` : data.imageUrl);
      }
      
      const updateFn = (prev) => {
        const newImagenes = [...(prev.imagenes || []), ...urls];
        return { ...prev, imagen: prev.imagen || newImagenes[0] || '', imagenes: newImagenes };
      };

      if (isEditForm) {
        setEditForm(updateFn);
      } else {
        setCreateForm(updateFn);
      }
      setNotice('Imagen(es) subida(s) correctamente.');
    } catch (err) {
      setNotice(err.message || 'Error al subir imagen(es)');
    }
  };

  const getMediaClass = (tamano) => {
    let cls = styles.productMedia;
    if (tamano === 'square') cls += ` ${styles.mediaSquare}`;
    else if (tamano === 'landscape') cls += ` ${styles.mediaLandscape}`;
    else if (tamano === 'portrait') cls += ` ${styles.mediaPortrait}`;
    return cls;
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === 'todos' || product.categoria === activeCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const searchable = [
      product.nombre,
      product.descripcion,
      product.sku,
      product.categoria,
    ]
      .filter(Boolean)
      .join(' ');

    const terms = searchQuery.trim().split(/\s+/).filter(Boolean);
    
    const regexes = terms.map((term) => {
      try {
        return new RegExp(term, 'i');
      } catch (e) {
        return new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }
    });

    return regexes.every((regex) => regex.test(searchable));
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const maxButtons = 3;
  const clampedCurrent = Math.max(1, Math.min(currentPage, totalPages));
  const startPage = Math.max(1, clampedCurrent - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  const pageStart = Math.max(1, endPage - maxButtons + 1);
  const pages = [];
  for (let page = pageStart; page <= endPage; page += 1) {
    pages.push(page);
  }

  const paginatedProducts = useMemo(() => {
    const startIndex = (clampedCurrent - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, clampedCurrent]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Productos</h2>
          <div className={styles.cardHeaderActions}>
            <button type="button" onClick={openCreate} className={styles.primary}>
              Crear producto
            </button>
            <button type="button" onClick={loadProducts} className={styles.secondary}>
              Recargar
            </button>
          </div>
        </div>

        {notice ? <p className={styles.notice}>{notice}</p> : null}

        {loading ? <p>Cargando...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategories={['todos', ...BASE_CATEGORIES]}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {!loading && products.length === 0 ? <p>No hay productos.</p> : null}
        {!loading && products.length > 0 && filteredProducts.length === 0 ? (
          <p className={styles.notice}>No hay productos que coincidan.</p>
        ) : null}

        <div className={styles.productsGrid}>
          {paginatedProducts.map((product) => {
            return (
              <div key={product.sku} className={styles.productCard}>
                <div className={getMediaClass(product.tamano_imagen)}>
                  {product.imagen?.trim() ? (
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={styles.noImage}>No hay imagen</div>
                  )}
                  {product.destacado && (
                    <div className={styles.productBadges}>
                      <span className={styles.badgeFeatured}>
                        Destacado
                      </span>
                    </div>
                  )}
                  
                  <div className={styles.adminOverlay}>
                    <button onClick={() => startEdit(product)} className={styles.overlayBtn}>
                      Editar
                    </button>
                    <button onClick={() => confirmDelete(product)} className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`}>
                      Eliminar
                    </button>
                  </div>
                </div>
                  
                <div className={styles.productContent}>
                  <span className={styles.productTag}>{product.categoria}</span>
                  <div className={styles.productHeadline}>
                    <h4 className={styles.productTitle}>{product.nombre}</h4>
                  </div>
                  <p className={styles.productDesc}>
                    {product.descripcion?.substring(0, 80)}
                    {product.descripcion?.length > 80 ? '...' : ''}
                  </p>
                  
                  <div className={styles.productActions} />
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={clampedCurrent === 1}
              onClick={() => handlePageChange(Math.max(1, clampedCurrent - 1))}
              className={styles.paginationButton}
            >
              <ChevronLeft size={16} />
              <span className={styles.hideMobile}>Anterior</span>
            </button>

            {pageStart > 1 ? (
              <>
                <button
                  className={styles.paginationPageButton}
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
                {pageStart > 2 ? (
                  <span className={styles.paginationEllipsis}>...</span>
                ) : null}
              </>
            ) : null}

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${styles.paginationPageButton} ${
                  page === clampedCurrent ? styles.paginationPageActive : ''
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages ? (
              <>
                {endPage < totalPages - 1 ? (
                  <span className={styles.paginationEllipsis}>...</span>
                ) : null}
                <button
                  className={styles.paginationPageButton}
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            ) : null}

            <button
              disabled={clampedCurrent === totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, clampedCurrent + 1))}
              className={styles.paginationButton}
            >
              <span className={styles.hideMobile}>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {editingSku ? (
          <div className={styles.modalOverlay} onClick={cancelEdit}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={cancelEdit}>&times;</button>

              <div className={styles.modalPreview}>
                <div className={`${styles.productCard} ${styles.modalPreviewCard}`}>
                  <div className={getMediaClass(editForm.tamano_imagen)}>
                    {editForm.imagen?.trim() ? (
                      <img
                        src={editForm.imagen}
                        alt={editForm.nombre}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.noImage}>No hay imagen</div>
                    )}
                    {editForm.destacado && (
                      <div className={styles.productBadges}>
                        <span className={styles.badgeFeatured}>
                          Destacado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.productContent}>
                    <span className={styles.productTag}>
                      {editForm.categoria || BASE_CATEGORIES[0]}
                    </span>
                    <div className={styles.productHeadline}>
                      <h4 className={styles.productTitle}>
                        {editForm.nombre || 'Nombre del producto'}
                      </h4>
                    </div>
                    <p className={styles.productDesc}>
                      {editForm.descripcion
                        ? editForm.descripcion.substring(0, 90)
                        : 'Descripcion corta del producto para la tarjeta.'}
                      {editForm.descripcion?.length > 90 ? '...' : ''}
                    </p>

                    <div className={styles.productActions} />

                  </div>
                </div>
                
                {/* INICIO GALERIA */}
                {(editForm.imagenes?.length > 0 || editForm.imagen) && (
                  <div className={styles.galleryContainer}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Galería de imágenes</p>
                    <div className={styles.galleryList}>
                      {(editForm.imagenes?.length > 0 ? editForm.imagenes : [editForm.imagen]).filter(img => img && img.trim() !== '').map((img, idx) => {
                        const isMain = img === editForm.imagen;
                        return (
                          <div 
                            key={idx} 
                            className={`${styles.galleryItem} ${isMain ? styles.galleryItemMain : ''}`}
                            draggable
                            onDragStart={(e) => {
                              setDraggedImgIdx(idx);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedImgIdx === null || draggedImgIdx === idx) return;
                              setEditForm(prev => {
                                const currentImages = prev.imagenes?.length > 0 ? prev.imagenes : [prev.imagen];
                                const newImages = [...currentImages];
                                const draggedImage = newImages.splice(draggedImgIdx, 1)[0];
                                newImages.splice(idx, 0, draggedImage);
                                return { ...prev, imagenes: newImages, imagen: newImages[0] || '' };
                              });
                              setDraggedImgIdx(null);
                            }}
                          >
                            <img src={img} alt="Thumb" />
                            <div className={styles.galleryActions}>
                              {!isMain && (
                                <button type="button" onClick={() => {
                                  setEditForm(prev => {
                                    // Move this image to the front of the array as well
                                    const currentImages = prev.imagenes?.length > 0 ? prev.imagenes : [prev.imagen];
                                    const newImages = currentImages.filter((_, i) => i !== idx);
                                    newImages.unshift(img);
                                    return { ...prev, imagenes: newImages, imagen: img };
                                  });
                                }} title="Fijar como portada">
                                  <Star size={14} />
                                </button>
                              )}
                              <button type="button" className={styles.deleteBtn} onClick={() => {
                                setEditForm(prev => {
                                  const currentImages = prev.imagenes?.length > 0 ? prev.imagenes : [prev.imagen];
                                  const newImages = currentImages.filter((_, i) => i !== idx);
                                  return { ...prev, imagenes: newImages, imagen: prev.imagen === img ? (newImages[0] || '') : prev.imagen };
                                });
                              }} title="Eliminar imagen">
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* FIN GALERIA */}
              </div>

              <div className={styles.modalFormArea}>
                <h3>Editar producto</h3>
                <div className={styles.formGrid}>
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Nombre
                    <input
                      value={editForm.nombre}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, nombre: event.target.value }))
                      }
                      className={styles.input}
                    />
                  </label>
                  
                  <label className={styles.label}>
                    SKU
                    <input value={editForm.sku} className={styles.input} disabled />
                  </label>
                  
                  <label className={styles.label}>
                    Categoria
                    <select
                      value={editForm.categoria}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, categoria: event.target.value }))
                      }
                      className={styles.input}
                    >
                      {BASE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.label}>
                    Tamaño Imagen
                    <select
                      value={editForm.tamano_imagen}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, tamano_imagen: event.target.value }))
                      }
                      className={styles.input}
                    >
                      <option value="default">Por defecto (4:3)</option>
                      <option value="square">Cuadrado (1:1)</option>
                      <option value="landscape">Horizontal (16:9)</option>
                      <option value="portrait">Vertical (3:4)</option>
                    </select>
                  </label>

                  <label className={styles.label}>
                    Moneda
                    <input
                      value={editForm.moneda}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, moneda: event.target.value }))
                      }
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label}>
                    ID Catalogo
                    <input
                      type="number"
                      value={editForm.id_catalogo}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          id_catalogo: event.target.value,
                        }))
                      }
                      className={styles.input}
                    />
                  </label>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox} style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={editForm.destacado}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            destacado: event.target.checked,
                          }))
                        }
                      />
                      Destacado
                    </label>
                  </div>

                  <div className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Imagen</span>
                      <div className={styles.switchContainer}>
                        <button
                          type="button"
                          className={`${styles.switchBtn} ${editForm.upload_mode === 'url' ? styles.active : ''}`}
                          onClick={() => setEditForm(prev => ({ ...prev, upload_mode: 'url' }))}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          className={`${styles.switchBtn} ${editForm.upload_mode === 'upload' ? styles.active : ''}`}
                          onClick={() => setEditForm(prev => ({ ...prev, upload_mode: 'upload' }))}
                        >
                          Archivo
                        </button>
                      </div>
                    </div>

                    {editForm.upload_mode === 'url' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <input
                          value={urlInputEdit}
                          onChange={(e) => setUrlInputEdit(e.target.value)}
                          className={styles.input}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        <button 
                          type="button" 
                          className={styles.secondary}
                          onClick={() => {
                            const url = urlInputEdit.trim();
                            if (!url) return;
                            const formatted = formatImageUrl(url);
                            setEditForm((prev) => {
                              const newImagenes = [...(prev.imagenes || []), formatted];
                              return { ...prev, imagenes: newImagenes, imagen: prev.imagen || newImagenes[0] || '' };
                            });
                            setUrlInputEdit('');
                          }}
                        >
                          Agregar imagen
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, true)}
                      >
                        <p>Arrastra tu(s) imagen(es) aquí o haz clic para subir</p>
                        <p className={styles.notice} style={{ marginTop: '-0.2rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                          Formatos: JPG, PNG, WEBP, AVIF
                        </p>
                        <label className={styles.secondary} style={{ cursor: 'pointer', margin: '0.5rem 0 0 0', display: 'inline-block' }}>
                          Seleccionar archivo(s)
                          <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Descripcion
                    <textarea
                      value={editForm.descripcion}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, descripcion: event.target.value }))
                      }
                      className={styles.textarea}
                      rows={4}
                    />
                  </label>
                </div>
                <div className={styles.formActions} style={{ marginTop: '2.5rem' }}>
                  <button type="button" className={styles.primary} onClick={handleUpdate}>
                    Guardar cambios
                  </button>
                  <button type="button" className={styles.secondary} onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isCreateOpen ? (
          <div className={styles.modalOverlay} onClick={closeCreate}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={closeCreate}>&times;</button>

              <div className={styles.modalPreview}>
                <div className={`${styles.productCard} ${styles.modalPreviewCard}`}>
                  <div className={getMediaClass(createForm.tamano_imagen)}>
                    {createForm.imagen?.trim() ? (
                      <img
                        src={createForm.imagen}
                        alt={createForm.nombre}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.noImage}>No hay imagen</div>
                    )}
                    {createForm.destacado && (
                      <div className={styles.productBadges}>
                        <span className={styles.badgeFeatured}>
                          Destacado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.productContent}>
                    <span className={styles.productTag}>
                      {createForm.categoria || BASE_CATEGORIES[0]}
                    </span>
                    <div className={styles.productHeadline}>
                      <h4 className={styles.productTitle}>
                        {createForm.nombre || 'Nombre del producto'}
                      </h4>
                    </div>
                    <p className={styles.productDesc}>
                      {createForm.descripcion
                        ? createForm.descripcion.substring(0, 90)
                        : 'Descripcion corta del producto para la tarjeta.'}
                      {createForm.descripcion?.length > 90 ? '...' : ''}
                    </p>

                    <div className={styles.productActions} />

                  </div>
                </div>
                
                {/* INICIO GALERIA */}
                {(createForm.imagenes?.length > 0 || createForm.imagen) && (
                  <div className={styles.galleryContainer}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Galería de imágenes</p>
                    <div className={styles.galleryList}>
                      {(createForm.imagenes?.length > 0 ? createForm.imagenes : [createForm.imagen]).filter(img => img && img.trim() !== '').map((img, idx) => {
                        const isMain = img === createForm.imagen;
                        return (
                          <div 
                            key={idx} 
                            className={`${styles.galleryItem} ${isMain ? styles.galleryItemMain : ''}`}
                            draggable
                            onDragStart={(e) => {
                              setDraggedImgIdx(idx);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedImgIdx === null || draggedImgIdx === idx) return;
                              setCreateForm(prev => {
                                const currentImages = prev.imagenes?.length > 0 ? prev.imagenes : [prev.imagen];
                                const newImages = [...currentImages];
                                const draggedImage = newImages.splice(draggedImgIdx, 1)[0];
                                newImages.splice(idx, 0, draggedImage);
                                return { ...prev, imagenes: newImages, imagen: newImages[0] || '' };
                              });
                              setDraggedImgIdx(null);
                            }}
                          >
                            <img src={img} alt="Thumb" />
                            <div className={styles.galleryActions}>
                              {!isMain && (
                                <button type="button" onClick={() => {
                                  setCreateForm(prev => {
                                    // Move this image to the front of the array as well
                                    const currentImages = prev.imagenes?.length > 0 ? prev.imagenes : [prev.imagen];
                                    const newImages = currentImages.filter((_, i) => i !== idx);
                                    newImages.unshift(img);
                                    return { ...prev, imagenes: newImages, imagen: img };
                                  });
                                }} title="Fijar como portada">
                                  <Star size={14} />
                                </button>
                              )}
                              <button type="button" className={styles.deleteBtn} onClick={() => {
                                setCreateForm(prev => {
                                  const currentImages = prev.imagenes?.length > 0 ? prev.imagenes : [prev.imagen];
                                  const newImages = currentImages.filter((_, i) => i !== idx);
                                  return { ...prev, imagenes: newImages, imagen: prev.imagen === img ? (newImages[0] || '') : prev.imagen };
                                });
                              }} title="Eliminar imagen">
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* FIN GALERIA */}
              </div>

              <div className={styles.modalFormArea}>
                <h3>Crear producto</h3>
                <form className={styles.formGrid} onSubmit={handleCreate}>
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Nombre
                    <input
                      value={createForm.nombre}
                      onChange={(event) =>
                        setCreateForm((prev) => {
                          const nombre = event.target.value;
                          return {
                            ...prev,
                            nombre,
                            sku: buildSkuFromName(nombre),
                          };
                        })
                      }
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label}>
                    SKU
                    <input
                      value={createForm.sku}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, sku: event.target.value }))
                      }
                      className={styles.input}
                      required
                      readOnly
                    />
                  </label>

                  <label className={styles.label}>
                    Categoria
                    <select
                      value={createForm.categoria}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, categoria: event.target.value }))
                      }
                      className={styles.input}
                    >
                      {BASE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.label}>
                    Tamaño Imagen
                    <select
                      value={createForm.tamano_imagen}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, tamano_imagen: event.target.value }))
                      }
                      className={styles.input}
                    >
                      <option value="default">Por defecto (4:3)</option>
                      <option value="square">Cuadrado (1:1)</option>
                      <option value="landscape">Horizontal (16:9)</option>
                      <option value="portrait">Vertical (3:4)</option>
                    </select>
                  </label>

                  <label className={styles.label}>
                    Moneda
                    <input
                      value={createForm.moneda}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, moneda: event.target.value }))
                      }
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label}>
                    ID Catalogo
                    <input
                      type="number"
                      value={createForm.id_catalogo}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, id_catalogo: event.target.value }))
                      }
                      className={styles.input}
                      readOnly
                    />
                  </label>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox} style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={createForm.destacado}
                        onChange={(event) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            destacado: event.target.checked,
                          }))
                        }
                      />
                      Destacado
                    </label>
                  </div>

                  <div className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Imagen</span>
                      <div className={styles.switchContainer}>
                        <button
                          type="button"
                          className={`${styles.switchBtn} ${createForm.upload_mode === 'url' ? styles.active : ''}`}
                          onClick={() => setCreateForm(prev => ({ ...prev, upload_mode: 'url' }))}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          className={`${styles.switchBtn} ${createForm.upload_mode === 'upload' ? styles.active : ''}`}
                          onClick={() => setCreateForm(prev => ({ ...prev, upload_mode: 'upload' }))}
                        >
                          Archivo
                        </button>
                      </div>
                    </div>

                    {createForm.upload_mode === 'url' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <input
                          value={urlInputCreate}
                          onChange={(e) => setUrlInputCreate(e.target.value)}
                          className={styles.input}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        <button 
                          type="button" 
                          className={styles.secondary}
                          onClick={() => {
                            const url = urlInputCreate.trim();
                            if (!url) return;
                            const formatted = formatImageUrl(url);
                            setCreateForm((prev) => {
                              const newImagenes = [...(prev.imagenes || []), formatted];
                              return { ...prev, imagenes: newImagenes, imagen: prev.imagen || newImagenes[0] || '' };
                            });
                            setUrlInputCreate('');
                          }}
                        >
                          Agregar imagen
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, false)}
                      >
                        <p>Arrastra tu(s) imagen(es) aquí o haz clic para subir</p>
                        <p className={styles.notice} style={{ marginTop: '-0.2rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                          Formatos: JPG, PNG, WEBP, AVIF
                        </p>
                        <label className={styles.secondary} style={{ cursor: 'pointer', margin: '0.5rem 0 0 0', display: 'inline-block' }}>
                          Seleccionar archivo(s)
                          <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>

                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Descripcion
                    <textarea
                      value={createForm.descripcion}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, descripcion: event.target.value }))
                      }
                      className={styles.textarea}
                      rows={4}
                    />
                  </label>

                  <div className={styles.formActions} style={{ marginTop: '2.5rem' }}>
                    <button type="submit" className={styles.primary}>
                      Crear producto
                    </button>
                    <button type="button" className={styles.secondary} onClick={closeCreate}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {deleteTarget ? (
          <div className={styles.modalOverlay} onClick={cancelDelete}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <h3>Confirmar eliminacion</h3>
              <p>
                Vas a eliminar <strong>{deleteTarget.nombre || deleteTarget.sku}</strong>.
                Esta accion no se puede deshacer.
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.danger} onClick={handleDelete}>
                  Eliminar
                </button>
                <button type="button" className={styles.secondary} onClick={cancelDelete}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
