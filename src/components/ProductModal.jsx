import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ProductModal.module.css';

export default function ProductModal({ product, onClose, onAddToCart }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className={styles.close} onClick={onClose}>
          <X className={styles.icon} aria-hidden="true" />
        </button>

        <div className={styles.media}>
          {product.image?.trim() ? (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.noImage}>No hay imagen</div>
          )}
          {product.raw?.destacado && (
            <div className={styles.badges}>
              {product.raw?.destacado && (
                <span className={styles.badgeFeatured}>Destacado</span>
              )}
            </div>
          )}
        </div>

        <div className={styles.content}>
          <span className={styles.tag}>{product.category}</span>
          <h2>{product.name}</h2>
          <p>{product.description || 'Sin descripcion disponible.'}</p>

          <button
            type="button"
            className={styles.primary}
            onClick={() => onAddToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
