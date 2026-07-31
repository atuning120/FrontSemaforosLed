import { forwardRef, useState, useEffect, useMemo } from 'react';
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
  ...props
}, ref) => {
  const isFeatured = type === 'featured' || product.featured;
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  let mediaClass = styles.media;
  if (product.tamano_imagen === 'square') mediaClass += ` ${styles.mediaSquare}`;
  else if (product.tamano_imagen === 'landscape') mediaClass += ` ${styles.mediaLandscape}`;
  else if (product.tamano_imagen === 'portrait') mediaClass += ` ${styles.mediaPortrait}`;

  return (
    <div
      ref={ref}
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
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        setIsHovered(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsHovered(false);
        onBlur?.(e);
      }}
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
