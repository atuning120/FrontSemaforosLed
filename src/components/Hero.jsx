import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MapPin,
  CreditCard,
  Building,
  Clock
} from 'lucide-react';
import WhatsAppModal from './WhatsAppModal.jsx';
import styles from './Hero.module.css';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';


export default function Hero() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setDirection(1);
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setDirection(-1);
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (idx) => {
    if (idx === currentSlide) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/hero`);
        if (response.ok) {
          const data = await response.json();
          setHeroSlides(data);
        }
      } catch (error) {
        console.error('Error fetching hero screens:', error);
      }
    };
    fetchScreens();
  }, []);

  useEffect(() => {
    if (isHoveringCarousel || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHoveringCarousel, currentSlide, heroSlides.length]);

  const handleCtaAction = (action) => {
    let el;
    if (action === 'catalog') el = document.getElementById('catalog');
    else if (action === 'featured') el = document.getElementById('featured-section') || document.getElementById('catalog');
    else if (action === 'videos') el = document.getElementById('video-section');
    else if (action === 'contact') el = document.getElementById('footer-location') || document.getElementById('footer') || document.querySelector('footer');
    else if (action === 'location') el = document.getElementById('footer-location') || document.querySelector('footer'); // keep for backward compatibility
    else if (action === 'offers') el = document.getElementById('featured-section') || document.getElementById('catalog'); // backward compatibility


    if (el) {
      const offset = 80;
      const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 600; // 0.6 segundos de duración
      let startTime = null;

      const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percent = Math.min(progress / duration, 1);

        window.scrollTo(0, startY + distance * easeInOutCubic(percent));

        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  };

  return (
    <>
      <section className={styles.heroSection}>
        <div
          className={styles.heroContainer}
          onMouseEnter={() => setIsHoveringCarousel(true)}
          onMouseLeave={() => setIsHoveringCarousel(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.carouselWrapper}>
            <AnimatePresence mode="wait" custom={direction}>
              {heroSlides.map((slide, idx) => {
                if (idx !== currentSlide) return null;
                return (
                  <motion.div
                    key={slide._id || idx}
                    custom={direction}
                    variants={{
                      enter: (dir) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
                      center: { opacity: 1, x: 0 },
                      exit: (dir) => ({ opacity: 0, x: dir > 0 ? -50 : 50 })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={styles.slide}
                  >
                    <div className={styles.slideBackground}>
                      <img 
                        src={slide.image} 
                        alt="" 
                        className={styles.slideImage} 
                      />
                      <div className={styles.slidePattern}></div>
                      <div className={styles.slideGradientBottom} style={{ opacity: slide.overlayOpacity !== undefined ? slide.overlayOpacity / 100 : 1 }}></div>
                      <div className={styles.slideGradientRight} style={{ opacity: slide.overlayOpacity !== undefined ? slide.overlayOpacity / 100 : 1 }}></div>
                    </div>

                    <div className={styles.slideContent}>
                      <div className={`${styles.badge} ${styles[slide.badgeClass] || styles.badgeCyan}`}>
                        <span className={styles.badgeDot}></span>
                        {slide.badge}
                      </div>

                      <h2 className={styles.title}>
                        {slide.titlePrimary} <br className={styles.hideMobile} />
                        {slide.titleSecondary} <span className={styles.titleHighlight}>{slide.titleHighlight}</span>
                      </h2>

                      <p className={styles.description}>
                        {slide.description}
                      </p>

                      {slide.detailInfo && (
                        <div className={styles.infoBox}>
                          <div className={styles.infoItem}>
                            {slide.order === 4 ? (
                              <CreditCard className={styles.infoIconIndigo} />
                            ) : (
                              <MapPin className={styles.infoIconAccent} />
                            )}
                            <div>
                              <p className={styles.infoLabel}>
                                {slide.order === 4 ? "MERCADO PAGO" : "DIRECCIÓN"}
                              </p>
                              <p className={styles.infoValue}>{slide.detailInfo.address}</p>
                            </div>
                          </div>
                          <div className={`${styles.infoItem} ${styles.infoItemBorder}`}>
                            {slide.order === 4 ? (
                              <Building className={styles.infoIconIndigo} />
                            ) : (
                              <Clock className={styles.infoIconAccent} />
                            )}
                            <div>
                              <p className={styles.infoLabel}>
                                {slide.order === 4 ? "TRANSFERENCIAS" : "HORARIOS"}
                              </p>
                              <p className={styles.infoValue}>{slide.detailInfo.hours}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={styles.actions}>
                        <button
                          onClick={() => handleCtaAction(slide.ctaAction)}
                          className={styles.primaryButton}
                        >
                          {slide.ctaText}
                        </button>

                        {slide.whatsappBadge && (
                          <button
                            onClick={() => setIsWhatsAppModalOpen(true)}
                            className={styles.secondaryButton}
                          >
                            <MessageCircle size={16} className={styles.whatsappIcon} />
                            PEDIDOS WHATSAPP
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button
              onClick={prevSlide}
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className={`${styles.navButton} ${styles.navButtonRight}`}
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>

            <div className={styles.indicators}>
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`${styles.indicatorDot} ${idx === currentSlide ? styles.indicatorDotActive : ''}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>


          </div>
        </div>
      </section>



      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
    </>
  );
}
