import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ProductModal.module.css';

export default function ProductModal({ product, onClose, onAddToCart }) {
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
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                referrerPolicy="no-referrer"
              />
              {images.length > 1 && (
                <>
                  <button 
                    className={`${styles.carouselBtn} ${styles.carouselBtnLeft}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    className={`${styles.carouselBtn} ${styles.carouselBtnRight}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className={styles.carouselIndicators}>
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        className={`${styles.indicator} ${idx === currentImageIndex ? styles.indicatorActive : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        aria-label={`Ir a la imagen ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
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
