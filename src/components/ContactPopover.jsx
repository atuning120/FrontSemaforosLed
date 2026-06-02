import { useState, useRef, useEffect } from 'react';
import { Mail, X, Send, Loader2 } from 'lucide-react';
import styles from './ContactPopover.module.css';

export default function ContactPopover({ buttonContent, targetEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const popoverRef = useRef(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, targetEmail })
      });

      if (!res.ok) throw new Error('Error al enviar');
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Cerrar y resetear después de 3 segundos
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className={styles.container} ref={popoverRef}>
      {/* Botón que dispara el popover */}
      <div 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        {buttonContent}
      </div>

      {/* Popover content */}
      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.header}>
            <h4>Redactar Correo</h4>
            <button 
              className={styles.closeBtn} 
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className={styles.body}>
            {status === 'success' ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <p>¡Mensaje enviado correctamente!</p>
                <span>Te responderemos a la brevedad.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="contact-name">Tu Nombre</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="contact-email">Tu Correo <span className={styles.required}>*</span></label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="contact-message">Mensaje <span className={styles.required}>*</span></label>
                  <textarea 
                    id="contact-message" 
                    name="message" 
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="¿En qué podemos ayudarte?"
                    rows="3"
                    required
                  />
                </div>

                {status === 'error' && (
                  <p className={styles.errorMessage}>Ocurrió un error. Intenta nuevamente.</p>
                )}

                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <Loader2 size={16} className={styles.spinner} />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}</span>
                </button>
              </form>
            )}
          </div>
          {/* Triángulo del tooltip apuntando hacia abajo */}
          <div className={styles.arrow}></div>
        </div>
      )}
    </div>
  );
}
