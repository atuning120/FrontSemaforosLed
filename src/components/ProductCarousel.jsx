import { useRef, useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({
  id,
  title,
  subtitle,
  icon,
  themeColor,
  products,
  type,
  onProductClick,
  onAddToCart,
  isPaused,
}) {
  const carouselRef = useRef(null);
  const loopWidthRef = useRef(0);
  const touchTimeoutRef = useRef(null);
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || products.length === 0) return;

    // Calculamos el ancho exacto del bucle usando la posición real de los elementos
    const children = el.children;
    if (children.length >= products.length * 2) {
      const firstItem = children[0];
      const targetItem = children[products.length * 2];
      if (firstItem && targetItem) {
        loopWidthRef.current = targetItem.offsetLeft - firstItem.offsetLeft;
      }
    }
    if (!loopWidthRef.current) {
      loopWidthRef.current = el.scrollWidth / 2;
    }

    let animationId;
    let accumulatedScroll = el.scrollLeft;
    let lastTime = performance.now();

    const scroll = (time) => {
      const delta = time - lastTime;
      lastTime = time;
      const loopWidth = loopWidthRef.current;

      if (!isInteractionActive && !isPaused) {
        const speed = 0.05;
        accumulatedScroll += speed * delta;
        
        if (accumulatedScroll >= loopWidth) {
          accumulatedScroll -= loopWidth;
        }
        
        el.scrollLeft = accumulatedScroll;
      } else {
        accumulatedScroll = el.scrollLeft;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isInteractionActive, isPaused, products?.length]);

  if (!products || products.length === 0) return null;

  const duplicatedProducts = [...products, ...products, ...products, ...products];

  const handleTouchStart = () => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    const el = carouselRef.current;
    const loopWidth = loopWidthRef.current || el?.scrollWidth / 2;
    if (el && loopWidth) {
      if (el.scrollLeft <= 10) {
        el.scrollLeft += loopWidth;
      } else if (el.scrollLeft >= loopWidth * 1.5) {
        el.scrollLeft -= loopWidth;
      }
    }
    setIsInteractionActive(true);
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => {
      setIsInteractionActive(false);
    }, 1500);
  };

  const handleMouseDown = (e) => {
    dragState.current.isDragging = true;
    setHasDragged(false);
    setIsInteractionActive(true);
    
    const el = carouselRef.current;
    if (el) {
      const loopWidth = loopWidthRef.current || el.scrollWidth / 2;
      if (el.scrollLeft <= 10) {
        el.scrollLeft += loopWidth;
      } else if (el.scrollLeft >= loopWidth * 1.5) {
        el.scrollLeft -= loopWidth;
      }
      dragState.current.startX = e.pageX - el.offsetLeft;
      dragState.current.scrollLeft = el.scrollLeft;
    }
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDragging) return;
    e.preventDefault();
    setHasDragged(true);
    const el = carouselRef.current;
    if (el) {
      const x = e.pageX - el.offsetLeft;
      const walk = (x - dragState.current.startX) * 1.5;
      let newScroll = dragState.current.scrollLeft - walk;
      
      const loopWidth = loopWidthRef.current || el.scrollWidth / 2;
      
      if (newScroll <= 10) {
        newScroll += loopWidth;
        dragState.current.startX = e.pageX - el.offsetLeft;
        dragState.current.scrollLeft = newScroll;
      } else if (newScroll >= loopWidth * 1.5) {
        newScroll -= loopWidth;
        dragState.current.startX = e.pageX - el.offsetLeft;
        dragState.current.scrollLeft = newScroll;
      }
      
      el.scrollLeft = newScroll;
    }
  };

  const handleMouseUpOrLeave = () => {
    dragState.current.isDragging = false;
    setIsInteractionActive(false);
  };

  const handleClickCapture = (e) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
      setHasDragged(false);
    }
  };

  return (
    <section id={id} className={styles.carouselSection}>
      <div>
        <div
          className={styles.carouselHeader}
          style={{ borderColor: themeColor }}
        >
          <div>
            <h3 className={styles.carouselTitle}>
              {icon && <span style={{ color: themeColor, marginRight: '0.5rem' }}>{icon}</span>}
              {title}
            </h3>
            <p className={styles.carouselSubtitle}>{subtitle}</p>
          </div>
        </div>

          <div className={styles.carouselWrap}>
            <div
              className={`${styles.carouselList} ${styles.infiniteScrollList}`}
              ref={carouselRef}
              onMouseEnter={() => setIsInteractionActive(true)}
              onMouseLeave={handleMouseUpOrLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUpOrLeave}
              onMouseMove={handleMouseMove}
              onClickCapture={handleClickCapture}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {duplicatedProducts.map((product, index) => {
                const hasOffer = type === 'offer';
                let discount = null;
                
                if (hasOffer && product.originalPrice) {
                  discount = Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );
                }

                return (
                  <ProductCard
                    key={`${type}-${product.id}-${index}`}
                    product={product}
                    type={type}
                    isCarousel={true}
                    onProductClick={onProductClick}
                    onAddToCart={onAddToCart}
                  />
                );
              })}
            </div>
          </div>
      </div>
    </section>
  );
}
