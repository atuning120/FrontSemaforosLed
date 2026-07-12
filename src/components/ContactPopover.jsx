import { useState, useRef, useEffect } from 'react';
import { Mail, X, Send, Loader2 } from 'lucide-react';
import styles from './ContactPopover.module.css';

const formatPhoneNumber = (value) => {
  if (!value) return '';
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length === 0) return value.includes('+') ? '+' : '';

  if (numericValue.startsWith('54')) {
    if (numericValue.length <= 2) return `+${numericValue}`;
    if (numericValue.length <= 3 && numericValue[2] === '9') return `+54 9`;
    
    let rest = numericValue.slice(numericValue[2] === '9' ? 3 : 2);
    let prefix = numericValue[2] === '9' ? '+54 9 ' : '+54 ';
    
    if (rest.length === 0) return prefix.trim();
    
    if (rest.startsWith('11')) {
      if (rest.length <= 2) return prefix + rest;
      if (rest.length <= 6) return prefix + rest.slice(0, 2) + ' ' + rest.slice(2);
      return prefix + rest.slice(0, 2) + ' ' + rest.slice(2, 6) + '-' + rest.slice(6, 10);
    } else {
      if (rest.length <= 3) return prefix + rest;
      if (rest.length <= 6) return prefix + rest.slice(0, 3) + ' ' + rest.slice(3);
      return prefix + rest.slice(0, 3) + ' ' + rest.slice(3, 6) + '-' + rest.slice(6, 10);
    }
  } else {
    let rest = numericValue;
    if (rest.startsWith('11') || rest.startsWith('011')) {
      let is011 = rest.startsWith('011');
      let acLen = is011 ? 3 : 2;
      if (rest.length <= acLen) return rest;
      if (rest.length <= acLen + 4) return rest.slice(0, acLen) + ' ' + rest.slice(acLen);
      return rest.slice(0, acLen) + ' ' + rest.slice(acLen, acLen + 4) + '-' + rest.slice(acLen + 4, acLen + 8);
    } else {
      let is0 = rest.startsWith('0');
      let acLen = is0 ? 4 : 3;
      if (rest.length <= acLen) return rest;
      if (rest.length <= acLen + 3) return rest.slice(0, acLen) + ' ' + rest.slice(acLen);
      return rest.slice(0, acLen) + ' ' + rest.slice(acLen, acLen + 3) + '-' + rest.slice(acLen + 3, acLen + 7);
    }
  }
};

export default function ContactPopover({ buttonContent, targetEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState('top');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [phoneError, setPhoneError] = useState('');
  
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

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

  const togglePopover = () => {
    if (!isOpen) {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // If there's less than 380px above the trigger, open downwards
        if (rect.top < 380) {
          setPlacement('bottom');
        } else {
          setPlacement('top');
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      const formattedPhone = formatPhoneNumber(e.target.value);
      setPhoneError('');
      setFormData({
        ...formData,
        phone: formattedPhone
      });
      return;
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const isValid = cleanPhone.length >= 10 && (cleanPhone.length === 10 || cleanPhone.startsWith('54'));
      if (!isValid) {
        setPhoneError('Ingresa un número argentino válido (Ej. 11 1234 5678).');
        return;
      }
    }

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
      setFormData({ name: '', email: '', phone: '', message: '' });
      setPhoneError('');
      
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
        onClick={togglePopover}
        ref={triggerRef}
        role="button"
        tabIndex={0}
      >
        {buttonContent}
      </div>

      {/* Popover content */}
      {isOpen && (
        <div className={`${styles.popover} ${placement === 'top' ? styles.popoverTop : styles.popoverBottom}`}>
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
                  <label htmlFor="contact-phone">Tu Teléfono (Opcional)</label>
                  <input 
                    type="tel" 
                    id="contact-phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej. 11 1234 5678"
                  />
                  {phoneError && <span className={styles.errorMessage} style={{fontSize: '12px', marginTop: '4px', display: 'block'}}>{phoneError}</span>}
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
          {/* Triángulo del tooltip */}
          <div className={`${styles.arrow} ${placement === 'top' ? styles.arrowTop : styles.arrowBottom}`}></div>
        </div>
      )}
    </div>
  );
}
