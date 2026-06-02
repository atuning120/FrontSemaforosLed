import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './WhatsAppModal.module.css';

export default function WhatsAppModal({ isOpen, onClose }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.farosledclean.com.ar';
  const predefinedMessage = `Hola! Estoy viendo tu catalogo y quiero consultar.\n\nLink: ${origin}`;

  const handleOpenWhatsApp = () => {
    const encodedMessage = encodeURIComponent(predefinedMessage);
    const envPhone = import.meta.env.VITE_WHATSAPP_PHONE;
    const phoneNumber = envPhone ? envPhone.trim() : '5491100000000';
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalMeta}>WHATSAPP</span>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <h3 className={styles.modalTitle}>¿ENVIAR ESTE MENSAJE?</h3>
            <p className={styles.modalSubtitle}>
              Se abre WhatsApp con el texto de abajo para que lo confirmes antes de enviarlo.
            </p>

            <div className={styles.messagePreview}>
              <p>Hola! Estoy viendo tu catalogo y quiero consultar.</p>
              <br />
              <p>Link: {origin}</p>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={onClose}
                className={styles.cancelButton}
              >
                CANCELAR
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className={styles.confirmButton}
              >
                ABRIR WHATSAPP
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
