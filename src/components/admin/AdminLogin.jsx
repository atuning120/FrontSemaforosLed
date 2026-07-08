import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './AdminLogin.module.css';

export default function AdminLogin({ baseUrl, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/captcha`);
      if (res.ok) {
        const data = await res.json();
        setCaptchaId(data.captchaId);
        setCaptchaImage(data.image);
        setCaptchaAnswer('');
      }
    } catch (e) {
      console.error('Error fetching captcha', e);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, captchaId, captchaAnswer }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Respuesta del servidor no válida');
      }

      if (!response.ok) {
        if (data && data.requireCaptcha) {
          if (!requireCaptcha) {
            setRequireCaptcha(true);
            fetchCaptcha();
          } else if (response.status === 403) {
            // Refrescar el captcha si falló
            fetchCaptcha();
          }
        }
        
        if (response.status === 403 && data && data.error) {
           throw new Error(typeof data.error === 'string' ? data.error : 'Error con el CAPTCHA');
        }

        if ([400, 401, 404].includes(response.status)) {
          throw new Error('Usuario o contraseña incorrectos');
        }
        const serverError = data && data.error ? data.error : 'Error al iniciar sesión';
        const errorMsg = typeof serverError === 'string' ? serverError : JSON.stringify(serverError);
        throw new Error(errorMsg);
      }

      if (data && data.token) {
        onSuccess(data.token);
      } else {
        throw new Error('Token inválido');
      }
    } catch (err) {
      let msg = 'Error al iniciar sesión';
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        msg = 'Error de conexión con el servidor.';
      } else if (err && err.message) {
        msg = String(err.message);
      } else if (typeof err === 'string') {
        msg = err;
      }
      
      // Sanitizar el mensaje de error: quitar HTML tags
      const sanitizedMsg = msg.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 150);
      setError(sanitizedMsg || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1>Acceso administrador</h1>
          <p>Ingresa tus credenciales para continuar.</p>
        </div>

        <label className={styles.label}>
          Usuario
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.label}>
          Contraseña
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Alternar visibilidad de la contraseña"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>

        {requireCaptcha && (
          <div className={styles.captchaContainer}>
            <label className={styles.label}>
              Resuelve el problema matemático
              <div className={styles.captchaImageWrapper}>
                {captchaImage ? (
                  <div 
                    className={styles.captchaSvg} 
                    dangerouslySetInnerHTML={{ __html: captchaImage }} 
                  />
                ) : (
                  <div className={styles.captchaPlaceholder}>Cargando CAPTCHA...</div>
                )}
                <button 
                  type="button" 
                  onClick={fetchCaptcha}
                  className={styles.refreshCaptchaButton}
                  title="Generar nuevo CAPTCHA"
                >
                  ↻
                </button>
              </div>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value)}
                className={styles.input}
                placeholder="Ej. 6"
                required={requireCaptcha}
              />
            </label>
          </div>
        )}

        {error ? <div className={styles.error}>{error}</div> : null}

        <button type="submit" className={styles.primary} disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
