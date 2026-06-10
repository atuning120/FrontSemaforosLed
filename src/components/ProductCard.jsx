import { forwardRef } from 'react';
import { MessageCircle } from 'lucide-react';
import styles from './ProductCard.module.css';

const ProductCard = forwardRef(({
  product,
  isCarousel = false,
  type = 'default',
  onProductClick,
  onQuote,
  ...props
}, ref) => {
  const isFeatured = type === 'featured' || product.featured;

  let mediaClass = styles.media;
  if (product.tamano_imagen === 'square') mediaClass += ` ${styles.mediaSquare}`;
  else if (product.tamano_imagen === 'landscape') mediaClass += ` ${styles.mediaLandscape}`;
  else if (product.tamano_imagen === 'portrait') mediaClass += ` ${styles.mediaPortrait}`;

  return (
    <div
      ref={ref}
      className={`${styles.product} ${isCarousel ? styles.carouselProduct : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onProductClick(product)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onProductClick(product);
        }
      }}
      {...props}
    >
      <div className={mediaClass}>
        {product.image?.trim() ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            draggable="false"
          />
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
