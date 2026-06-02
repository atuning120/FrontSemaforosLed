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

const HERO_SLIDES = [
  {
    id: 1,
    badge: "Eficiencia que Ilumina tu Vida",
    badgeClass: styles.badgeCyan,
    titlePrimary: "TECNOLOGÍA LED",
    titleSecondary: "Y",
    titleHighlight: "SUMINISTROS",
    description: "Soluciones de iluminación eficientes y sustentables, materiales de alto rendimiento y la mejor asesoría técnica para tus proyectos.",
    image: "https://res.cloudinary.com/dse8u2afw/image/upload/v1779914689/image_ec1c48a8_h5uty2.png",
    ctaText: "VER PRODUCTOS",
    ctaAction: "catalog",
    whatsappBadge: true,
  },
  {
    id: 2,
    badge: "Catálogo Digital",
    badgeClass: styles.badgeEmerald,
    titlePrimary: "CONOCÉ NUESTRA",
    titleSecondary: "TIENDA",
    titleHighlight: "ONLINE",
    description: "Explorá todo nuestro catálogo de productos desde la comodidad de tu casa. Realizá tus compras de forma rápida, segura y con la mejor atención.",
    detailInfo: {
      address: "Envíos y retiros disponibles",
      hours: "Atención web 24/7",
    },
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    ctaText: "VER CATÁLOGO",
    ctaAction: "catalog",
    whatsappBadge: false,
  },
  {
    id: 3,
    badge: "Envíos a toda Argentina",
    badgeClass: styles.badgeAmber,
    titlePrimary: "HACEMOS ENVÍOS A",
    titleSecondary: "TODO EL",
    titleHighlight: "PAÍS",
    description: "Despachamos tus pedidos de forma rápida y segura a cualquier punto de la Argentina. Comprá a través de la web y recibilo en la puerta de tu casa o sucursal de correo más cercana.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
    ctaText: "VER OFERTAS",
    ctaAction: "offers",
    whatsappBadge: true,
  },
  {
    id: 4,
    badge: "Mercado Pago & Transferencia",
    badgeClass: styles.badgeIndigo,
    titlePrimary: "PAGÁ DE LA FORMA",
    titleSecondary: "MÁS SIMPLE Y",
    titleHighlight: "CONVENIENTE",
    description: "Realizá tus compras abonando de manera 100% segura mediante Mercado Pago (todas las tarjetas de crédito y débito) o transferencia bancaria directa.",
    detailInfo: {
      address: "Tarjetas de crédito, débito y dinero en cuenta",
      hours: "Transferencias directas inmediatas en pesos",
    },
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1600&auto=format&fit=crop",
    ctaText: "VER PRODUCTOS",
    ctaAction: "catalog",
    whatsappBadge: true,
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
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
    if (isHoveringCarousel) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHoveringCarousel, currentSlide]);

  const handleCtaAction = (action) => {
    let el;
    if (action === 'catalog') el = document.getElementById('catalog');
    else if (action === 'location') el = document.getElementById('footer-location');
    else if (action === 'offers') el = document.getElementById('offers-section') || document.getElementById('catalog');

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
              {HERO_SLIDES.map((slide, idx) => {
                if (idx !== currentSlide) return null;
                return (
                  <motion.div
                    key={slide.id}
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
                      <img src={slide.image} alt="" className={styles.slideImage} />
                      <div className={styles.slidePattern}></div>
                      <div className={styles.slideGradientBottom}></div>
                      <div className={styles.slideGradientRight}></div>
                    </div>

                    <div className={styles.slideContent}>
                      <div className={`${styles.badge} ${slide.badgeClass}`}>
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
                            {slide.id === 4 ? (
                              <CreditCard className={styles.infoIconIndigo} />
                            ) : (
                              <MapPin className={styles.infoIconAccent} />
                            )}
                            <div>
                              <p className={styles.infoLabel}>
                                {slide.id === 4 ? "MERCADO PAGO" : "DIRECCIÓN"}
                              </p>
                              <p className={styles.infoValue}>{slide.detailInfo.address}</p>
                            </div>
                          </div>
                          <div className={`${styles.infoItem} ${styles.infoItemBorder}`}>
                            {slide.id === 4 ? (
                              <Building className={styles.infoIconIndigo} />
                            ) : (
                              <Clock className={styles.infoIconAccent} />
                            )}
                            <div>
                              <p className={styles.infoLabel}>
                                {slide.id === 4 ? "TRANSFERENCIAS" : "HORARIOS"}
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
              {HERO_SLIDES.map((_, idx) => (
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
