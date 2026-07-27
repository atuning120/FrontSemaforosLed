import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import styles from './ProductImageZoom.module.css';

export default function ProductImageZoom({ src, alt, destacado, oferta }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lensStyle, setLensStyle] = useState({});

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkDesktop = () => {
      const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isWideScreen = window.innerWidth >= 769;
      const nextIsDesktop = hasHover && isWideScreen;
      setIsDesktop(nextIsDesktop);
      if (!nextIsDesktop) {
        setShowLens(false);
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const calculateImageRect = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return null;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return null;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (!cw || !ch) return null;

    const scale = Math.min(cw / nw, ch / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    const offsetX = (cw - dw) / 2;
    const offsetY = (ch - dh) / 2;

    return {
      cw,
      ch,
      nw,
      nh,
      dw,
      dh,
      offsetX,
      offsetY,
    };
  }, []);

  const recalculateLens = useCallback((currentZoom, pos) => {
    const imgRect = calculateImageRect();
    if (!imgRect) {
      setLensStyle({
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      });
      return;
    }

    const lensSize = Math.min(220, Math.max(160, Math.floor(imgRect.cw * 0.45)));
    const lensRadius = lensSize / 2;

    const relX = (pos.x - imgRect.offsetX) / imgRect.dw;
    const relY = (pos.y - imgRect.offsetY) / imgRect.dh;
    const clampedX = Math.max(0, Math.min(1, relX));
    const clampedY = Math.max(0, Math.min(1, relY));

    const bgWidth = imgRect.dw * currentZoom;
    const bgHeight = imgRect.dh * currentZoom;

    const bgPosX = lensRadius - clampedX * bgWidth;
    const bgPosY = lensRadius - clampedY * bgHeight;

    setLensStyle({
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      backgroundImage: `url(${JSON.stringify(src)})`,
      backgroundSize: `${bgWidth}px ${bgHeight}px`,
      backgroundPosition: `${bgPosX}px ${bgPosY}px`,
    });
  }, [calculateImageRect, src]);

  const handleMouseMove = useCallback((e) => {
    if (!isDesktop || !imageLoaded) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const imgRect = calculateImageRect();
    if (!imgRect) return;

    const relX = (x - imgRect.offsetX) / imgRect.dw;
    const relY = (y - imgRect.offsetY) / imgRect.dh;

    const isOverImage = relX >= -0.005 && relX <= 1.005 && relY >= -0.005 && relY <= 1.005;
    if (!isOverImage) {
      setShowLens(false);
      return;
    }

    mousePosRef.current = { x, y };
    recalculateLens(zoomLevel, { x, y });
    setShowLens(true);
  }, [isDesktop, imageLoaded, calculateImageRect, recalculateLens, zoomLevel]);

  const handleMouseLeave = useCallback(() => {
    setShowLens(false);
  }, []);

  const handleImageClick = useCallback(() => {
    if (!isDesktop || !showLens) return;
    setZoomLevel((prev) => {
      let next = 2.0;
      if (prev < 2.3) next = 2.5;
      else if (prev < 2.9) next = 3.2;
      else if (prev < 3.8) next = 4.0;

      recalculateLens(next, mousePosRef.current);
      return next;
    });
  }, [isDesktop, showLens, recalculateLens]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isDesktop) return;

    const handleWheel = (e) => {
      if (!showLens) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      setZoomLevel((prev) => {
        const next = Math.min(Math.max(1.8, prev + delta), 4.0);
        const rounded = Number(next.toFixed(2));
        recalculateLens(rounded, mousePosRef.current);
        return rounded;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isDesktop, showLens, recalculateLens]);

  const handleImageRef = useCallback((node) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.mainImageContainer} ${isDesktop && showLens ? styles.zoomingCursor : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleImageClick}
    >
      <img
        ref={handleImageRef}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className={styles.mainImage}
        onLoad={() => setImageLoaded(true)}
      />

      {(destacado || oferta) && (
        <div className={styles.badges}>
          {oferta && <span className={styles.badgeOffer}>Oferta</span>}
          {destacado && <span className={styles.badgeFeatured}>Destacado</span>}
        </div>
      )}

      {isDesktop && (
        <>
          <div
            className={`${styles.lens} ${showLens ? styles.lensVisible : ''}`}
            style={lensStyle}
            aria-hidden="true"
          >
            <div className={styles.lensReflection} />
            <div className={styles.lensBadge}>{zoomLevel.toFixed(1)}x</div>
          </div>

          <div
            className={`${styles.zoomHint} ${showLens ? styles.zoomHintHidden : ''}`}
            aria-hidden="true"
          >
            <Search size={14} className={styles.zoomHintIcon} />
            <span>Pasa el mouse para explorar con lupa</span>
          </div>
        </>
      )}
    </div>
  );
}
