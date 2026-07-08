import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './MapPopover.module.css';

export default function MapPopover({ buttonContent, mapUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.container} ref={popoverRef}>
      {/* Botón que dispara el popover */}
      <div 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        {buttonContent}
      </div>

      {/* Popover content */}
      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.header}>
            <h4>Ubicación</h4>
            <button 
              className={styles.closeBtn} 
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className={styles.body}>
            <div className={styles.mapContainer}>
              <iframe 
                src={mapUrl || "https://maps.google.com/maps?q=-31.5402377,-68.5173167&hl=es&z=16&output=embed"} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Ubicación"
              ></iframe>
            </div>
          </div>
          {/* Triángulo del tooltip apuntando hacia abajo */}
          <div className={styles.arrow}></div>
        </div>
      )}
    </div>
  );
}
