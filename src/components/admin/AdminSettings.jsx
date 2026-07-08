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
        setStoreAddressName(data.storeAddressName || '');
        setStoreAddressMapUrl(data.storeAddressMapUrl || '');
      } catch (err) {
        setSettingsError(err.message);
      } finally {
        setSettingsLoading(false);
      }
    }
    loadSettings();
  }, [baseUrl]);

  const handleSettingsSubmit = async (event) => {
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
        body: JSON.stringify({ storeAddressName, storeAddressMapUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar configuraciones');
      }

      setSettingsSuccess('Configuraciones de la tienda actualizadas correctamente');
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

        {error ? <div className={styles.error}>{error}</div> : null}
        {success ? <div className={styles.success}>{success}</div> : null}

        <button type="submit" className={styles.primary} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <form className={styles.settingsCard} onSubmit={handleSettingsSubmit}>
        <h2>Información de la Tienda</h2>
        <p>Configura la dirección que aparece en el pie de página y en el mapa de ubicación.</p>

        {settingsLoading ? (
          <p>Cargando configuraciones...</p>
        ) : (
          <>
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
              <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                Para obtener el codigo HTML completo de el mapa accede a <strong>COMPARTIR</strong> -{'>'} <strong>INSERTAR UN MAPA</strong> -{'>'} <strong>COPIAR HTML</strong>.
              </span>
            </label>

            {settingsError ? <div className={styles.error}>{settingsError}</div> : null}
            {settingsSuccess ? <div className={styles.success}>{settingsSuccess}</div> : null}

            <button type="submit" className={styles.primary} disabled={isUpdatingSettings}>
              {isUpdatingSettings ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
