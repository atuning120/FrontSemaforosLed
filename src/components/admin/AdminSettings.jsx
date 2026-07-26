import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './AdminSettings.module.css';

export default function AdminSettings({ baseUrl, token, onCredentialsUpdated }) {
  const [masterPin, setMasterPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMasterPin, setShowMasterPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [storeAddressName, setStoreAddressName] = useState('');
  const [storeAddressMapUrl, setStoreAddressMapUrl] = useState('');

  const [emailCorporativoTitle, setEmailCorporativoTitle] = useState('');
  const [emailCorporativo, setEmailCorporativo] = useState('');
  const [emailConsultasTitle, setEmailConsultasTitle] = useState('');
  const [emailConsultas, setEmailConsultas] = useState('');

  const [whatsappSoporteTitle, setWhatsappSoporteTitle] = useState('');
  const [whatsappSoporte, setWhatsappSoporte] = useState('');
  const [whatsappComercialTitle, setWhatsappComercialTitle] = useState('');
  const [whatsappComercial, setWhatsappComercial] = useState('');

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${baseUrl}/api/settings`);
        if (!response.ok) throw new Error('Error al cargar configuraciones');
        const data = await response.json();
        setStoreAddressName(data.storeAddressName || import.meta.env.VITE_STORE_ADDRESS || 'Maipú 942 Este, San Juan, Argentina');
        setStoreAddressMapUrl(data.storeAddressMapUrl || 'https://maps.google.com/maps?q=-31.5402377,-68.5173167&hl=es&z=16&output=embed');
        setEmailCorporativoTitle(data.emailCorporativoTitle || 'Email Corporativo');
        setEmailCorporativo(data.emailCorporativo || import.meta.env.VITE_EMAIL || 'ventas@ledclean.ar');
        setEmailConsultasTitle(data.emailConsultasTitle || 'Consultas y Ayuda');
        setEmailConsultas(data.emailConsultas || import.meta.env.VITE_CONSULTAS_EMAIL || 'consultas@ledclean.ar');
        setWhatsappSoporteTitle(data.whatsappSoporteTitle || 'WhatsApp Soporte');
        setWhatsappSoporte(data.whatsappSoporte || import.meta.env.VITE_WHATSAPP_PHONE || '');
        setWhatsappComercialTitle(data.whatsappComercialTitle || 'WhatsApp Comercial');
        setWhatsappComercial(data.whatsappComercial || import.meta.env.VITE_WHATSAPP_SECOND || '');
      } catch (err) {
        setSettingsError(err.message);
      } finally {
        setSettingsLoading(false);
      }
    }
    loadSettings();
  }, [baseUrl]);

  const handleSettingsSubmit = async (event, formName) => {
    event.preventDefault();
    setIsUpdatingSettings(true);
    setSettingsError('');
    setSettingsSuccess('');

    try {
      const response = await fetch(`${baseUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeAddressName,
          storeAddressMapUrl,
          emailCorporativoTitle,
          emailCorporativo,
          emailConsultasTitle,
          emailConsultas,
          whatsappSoporteTitle,
          whatsappSoporte,
          whatsappComercialTitle,
          whatsappComercial
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar configuraciones');
      }

      setSettingsSuccess(formName);
    } catch (err) {
      setSettingsError(err.message || 'Error al actualizar configuraciones');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${baseUrl}/api/admin/credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ masterPin, username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar credenciales');
      }

      setSuccess('Credenciales actualizadas correctamente');
      setMasterPin('');
      setUsername('');
      setPassword('');
      setShowMasterPin(false);
      setShowPassword(false);

      if (data.token) {
        onCredentialsUpdated(data.token);
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar credenciales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.settingsWrapper}>


      <div className={styles.settingsFormWrapper}>
        {settingsLoading ? (
          <div className={styles.settingsCard} style={{ width: '100%', maxWidth: 'none', textAlign: 'center' }}>
            <p>Cargando configuraciones...</p>
          </div>
        ) : (
          <>
            <form className={styles.settingsCard} onSubmit={(e) => handleSettingsSubmit(e, 'address')}>
              <h2>Dirección y Mapa</h2>
              <p>Configura la dirección que aparece en el pie de página y en el mapa de ubicación.</p>

              <label className={styles.label}>
                Nombre de la dirección
                <input
                  type="text"
                  value={storeAddressName}
                  onChange={(event) => setStoreAddressName(event.target.value)}
                  className={styles.input}
                  required
                  placeholder="Ej. Maipú 942 Este, San Juan, Argentina"
                />
              </label>

              <label className={styles.label}>
                URL de Google Maps
                <input
                  type="text"
                  value={storeAddressMapUrl}
                  onChange={(event) => {
                    let val = event.target.value;
                    const srcMatch = val.match(/src="([^"]+)"/);
                    if (srcMatch && srcMatch[1]) {
                      val = srcMatch[1];
                    }
                    setStoreAddressMapUrl(val);
                  }}
                  className={styles.input}
                  required
                  placeholder="Pega el código iframe completo o solo el enlace"
                />
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                  Para obtener el codigo HTML completo de el mapa accede a <strong>COMPARTIR</strong> -{'>'} <strong>INSERTAR UN MAPA</strong> -{'>'} <strong>COPIAR HTML</strong>.
                </span>
              </label>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {settingsError ? <div className={styles.error} style={{ marginBottom: '1rem' }}>{settingsError}</div> : null}
                {settingsSuccess === 'address' ? <div className={styles.success} style={{ marginBottom: '1rem' }}>Configuraciones actualizadas correctamente</div> : null}
                <button type="submit" className={styles.primary} disabled={isUpdatingSettings} style={{ width: '100%' }}>
                  {isUpdatingSettings ? 'Guardando...' : 'Guardar Dirección'}
                </button>
              </div>
            </form>

            <form className={styles.settingsCard} onSubmit={(e) => handleSettingsSubmit(e, 'emails')}>
              <h2>Correos Electrónicos</h2>
              <p>Configura los correos de contacto para clientes.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0' }}>Email #1</h3>
                <div className={styles.inputGrid}>
                  <label className={styles.label}>
                    Título
                    <input
                      type="text"
                      value={emailCorporativoTitle}
                      onChange={(event) => setEmailCorporativoTitle(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. Email Corporativo"
                    />
                  </label>
                  <label className={styles.label}>
                    Email
                    <input
                      type="email"
                      value={emailCorporativo}
                      onChange={(event) => setEmailCorporativo(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. ventas@ledclean.ar"
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0' }}>Email #2  </h3>
                <div className={styles.inputGrid}>
                  <label className={styles.label}>
                    Título
                    <input
                      type="text"
                      value={emailConsultasTitle}
                      onChange={(event) => setEmailConsultasTitle(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. Consultas y Ayuda"
                    />
                  </label>
                  <label className={styles.label}>
                    Email
                    <input
                      type="email"
                      value={emailConsultas}
                      onChange={(event) => setEmailConsultas(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. consultas@ledclean.ar"
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {settingsError ? <div className={styles.error} style={{ marginBottom: '1rem' }}>{settingsError}</div> : null}
                {settingsSuccess === 'emails' ? <div className={styles.success} style={{ marginBottom: '1rem' }}>Configuraciones actualizadas correctamente</div> : null}
                <button type="submit" className={styles.primary} disabled={isUpdatingSettings} style={{ width: '100%' }}>
                  {isUpdatingSettings ? 'Guardando...' : 'Guardar Correos'}
                </button>
              </div>
            </form>

            <form className={styles.settingsCard} onSubmit={(e) => handleSettingsSubmit(e, 'phones')}>
              <h2>WhatsApp y Teléfonos</h2>
              <p>Configura los números de atención rápida.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0' }}>WhatsApp #1</h3>
                <div className={styles.inputGrid}>
                  <label className={styles.label}>
                    Título
                    <input
                      type="text"
                      value={whatsappSoporteTitle}
                      onChange={(event) => setWhatsappSoporteTitle(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. WhatsApp Soporte"
                    />
                  </label>
                  <label className={styles.label}>
                    Número
                    <input
                      type="text"
                      value={whatsappSoporte}
                      onChange={(event) => setWhatsappSoporte(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. 5492641234567"
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0' }}>WhatsApp #2</h3>
                <div className={styles.inputGrid}>
                  <label className={styles.label}>
                    Título
                    <input
                      type="text"
                      value={whatsappComercialTitle}
                      onChange={(event) => setWhatsappComercialTitle(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. WhatsApp Comercial"
                    />
                  </label>
                  <label className={styles.label}>
                    Número
                    <input
                      type="text"
                      value={whatsappComercial}
                      onChange={(event) => setWhatsappComercial(event.target.value)}
                      className={styles.input}
                      placeholder="Ej. 5492647654321"
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {settingsError ? <div className={styles.error} style={{ marginBottom: '1rem' }}>{settingsError}</div> : null}
                {settingsSuccess === 'phones' ? <div className={styles.success} style={{ marginBottom: '1rem' }}>Configuraciones actualizadas correctamente</div> : null}
                <button type="submit" className={styles.primary} disabled={isUpdatingSettings} style={{ width: '100%' }}>
                  {isUpdatingSettings ? 'Guardando...' : 'Guardar Teléfonos'}
                </button>
              </div>
            </form>
            <form className={styles.settingsCard} onSubmit={handleSubmit}>
              <h2>Cambiar credenciales</h2>
              <p>Actualiza el usuario y contraseña del panel de administración.</p>

              <label className={styles.label}>
                PIN Maestro
                <div className={styles.inputWrapper}>
                  <input
                    type={showMasterPin ? "text" : "password"}
                    value={masterPin}
                    onChange={(event) => setMasterPin(event.target.value)}
                    className={styles.input}
                    required
                    placeholder="Introduce el PIN Maestro"
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowMasterPin(!showMasterPin)}
                    aria-label="Alternar visibilidad del PIN Maestro"
                  >
                    {showMasterPin ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </label>

              <label className={styles.label}>
                Nuevo usuario
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={styles.input}
                  required
                  placeholder="Nuevo usuario o el mismo"
                />
              </label>

              <label className={styles.label}>
                Nueva contraseña
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={styles.input}
                    required
                    placeholder="Nueva contraseña"
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Alternar visibilidad de la nueva contraseña"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </label>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {error ? <div className={styles.error} style={{ marginBottom: '1rem' }}>{error}</div> : null}
                {success ? <div className={styles.success} style={{ marginBottom: '1rem' }}>{success}</div> : null}

                <button type="submit" className={styles.primary} disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Guardando...' : 'Actualizar Credenciales'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
