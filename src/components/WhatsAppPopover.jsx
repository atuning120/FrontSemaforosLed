import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import styles from './ContactPopover.module.css';

export default function WhatsAppPopover({ buttonContent, phoneNumber }) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState('top');
  
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

  const handleConfirm = () => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
    setIsOpen(false);
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
            <h4>Confirmar WhatsApp</h4>
            <button 
              className={styles.closeBtn} 
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className={styles.body}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
              <div style={{ backgroundColor: '#22c55e', color: 'white', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={32} />
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9', lineHeight: '1.4' }}>
                Estás a punto de abrir WhatsApp para enviar un mensaje al número:<br/><br/>
                <strong style={{ fontSize: '1.1rem' }}>+{phoneNumber}</strong>
              </p>
              <button 
                onClick={handleConfirm}
                className={styles.submitBtn} 
                style={{ backgroundColor: '#22c55e', width: '100%', marginTop: '8px' }}
              >
                Abrir en WhatsApp
              </button>
            </div>
          </div>
          {/* Triángulo del tooltip */}
          <div className={`${styles.arrow} ${placement === 'top' ? styles.arrowTop : styles.arrowBottom}`}></div>
        </div>
      )}
    </div>
  );
}
