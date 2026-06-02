import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import styles from './Toast.module.css';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={styles.toast}
          >
            <CheckCircle2 className={styles.icon} size={20} />
            <div className={styles.content}>
              <p className={styles.title}>Agregado al carrito</p>
              <p className={styles.message}>{toast.productName}</p>
            </div>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Cerrar notificación">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
