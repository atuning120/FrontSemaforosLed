import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import styles from './ProductModal.module.css';

export default function ProductModal({ product, onClose, onQuote }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

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
          {images.length > 0 ? (
            <div className={styles.mainImageContainer}>
              <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Imagen principal`}
                referrerPolicy="no-referrer"
                className={styles.mainImage}
              />
              {product.raw?.destacado && (
                <div className={styles.badges}>
                  <span className={styles.badgeFeatured}>Destacado</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.mainImageContainer}>
              <div className={styles.noImage}>No hay imagen</div>
            </div>
          )}

          {images.length > 1 && (
            <div className={styles.thumbnailGallery}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnailBtn} ${idx === currentImageIndex ? styles.thumbnailActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} referrerPolicy="no-referrer" />
                </button>
              ))}
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
            onClick={() => onQuote(product)}
          >
            <MessageCircle size={20} />
            Cotizar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
