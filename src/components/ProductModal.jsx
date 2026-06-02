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

  const percentage = Number(product.raw?.porcentaje_oferta || 0);
  const hasOffer = Boolean(product.raw?.en_oferta) && percentage > 0;
  const oldPrice = hasOffer
    ? Math.round(product.price / (1 - percentage / 100))
    : null;

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
          {(hasOffer || product.raw?.destacado) && (
            <div className={styles.badges}>
              {hasOffer && (
                <span className={styles.badgeOffer}>Oferta {percentage}%</span>
              )}
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

          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price.toLocaleString()}</span>
            {hasOffer && oldPrice ? (
              <span className={styles.oldPrice}>
                ${oldPrice.toLocaleString()}
              </span>
            ) : null}
          </div>

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
