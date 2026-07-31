import { forwardRef, useState, useEffect, useMemo, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import styles from './ProductCard.module.css';

const ProductCard = forwardRef(({
  product,
  isCarousel = false,
  type = 'default',
  onProductClick,
  onQuote,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onContextMenu,
  ...props
}, ref) => {
  const isFeatured = type === 'featured' || product.featured;
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const instanceIdRef = useRef(Math.random().toString(36).substring(2, 9));
  const cardRef = useRef(null);
  const setRef = (el) => {
    cardRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };

  const activateCard = () => {
    setIsHovered((prev) => {
      if (!prev) {
        window.dispatchEvent(
          new CustomEvent('product-card-activate', {
            detail: instanceIdRef.current,
          })
        );
      }
      return true;
    });
  };

  useEffect(() => {
    const handleOtherCardActivated = (e) => {
      if (e.detail !== instanceIdRef.current) {
        setIsHovered(false);
      }
    };

    window.addEventListener('product-card-activate', handleOtherCardActivated);
    return () => {
      window.removeEventListener('product-card-activate', handleOtherCardActivated);
    };
  }, []);

  const images = useMemo(() => {
    const list =
      product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];
    const valid = list.filter(
      (img) => img && typeof img === 'string' && img.trim() !== ''
    );
    const unique = [...new Set(valid)];
    return unique.length > 0 ? unique : product.image ? [product.image] : [];
  }, [product.images, product.image]);

  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1500);

    return () => clearInterval(timer);
  }, [isHovered, images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const handleGlobalTouchMove = (e) => {
      if (!e.touches || !e.touches[0] || !cardRef.current) return;
      const touch = e.touches[0];
      const rect = cardRef.current.getBoundingClientRect();
      const isOver =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;

      if (isOver) {
        activateCard();
      } else {
        setIsHovered(false);
      }
    };

    const handleGlobalTouchStart = (e) => {
      if (!cardRef.current) return;
      if (!cardRef.current.contains(e.target)) {
        setIsHovered(false);
      }
    };

    window.addEventListener('touchmove', handleGlobalTouchMove, {
      passive: true,
    });
    window.addEventListener('touchstart', handleGlobalTouchStart, {
      passive: true,
    });

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchstart', handleGlobalTouchStart);
    };
  }, [images.length]);

  const handleTouchStart = (e) => {
    activateCard();
    onTouchStart?.(e);
  };

  let mediaClass = styles.media;
  if (product.tamano_imagen === 'square') mediaClass += ` ${styles.mediaSquare}`;
  else if (product.tamano_imagen === 'landscape') mediaClass += ` ${styles.mediaLandscape}`;
  else if (product.tamano_imagen === 'portrait') mediaClass += ` ${styles.mediaPortrait}`;

  return (
    <div
      ref={setRef}
      className={`${styles.product} ${isCarousel ? styles.carouselProduct : ''} ${
        isHovered ? styles.productHovered : ''
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onProductClick(product)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onProductClick(product);
        }
      }}
      onMouseEnter={(e) => {
        activateCard();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        activateCard();
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsHovered(false);
        onBlur?.(e);
      }}
      onTouchStart={handleTouchStart}
      {...props}
    >
      <div className={mediaClass}>
        {images.length > 0 ? (
          images.map((imgSrc, idx) => (
            <div
              key={idx}
              className={`${styles.imageLayer} ${
                idx === currentImageIndex
                  ? styles.imageLayerActive
                  : styles.imageLayerInactive
              }`}
            >
              <img
                src={imgSrc}
                alt={`${product.name}${images.length > 1 ? ` - Imagen ${idx + 1}` : ''}`}
                referrerPolicy="no-referrer"
                draggable="false"
              />
            </div>
          ))
        ) : (
          <div className={styles.noImage}>No hay imagen</div>
        )}

        {isFeatured && (
          <div className={styles.badges}>
            <span className={styles.badgeFeatured}>Destacado</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.tag}>{product.category}</span>
        <div className={styles.headline}>
          <h4>{product.name}</h4>
        </div>
        <p>{product.description}</p>
        <div className={styles.actions}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onQuote(product);
            }}
            className={styles.cta}
          >
            <MessageCircle className={styles.ctaIcon} aria-hidden="true" />
            Cotizar
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
