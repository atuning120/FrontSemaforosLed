import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import WhatsAppModal from './WhatsAppModal.jsx';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton({ isCartOpen }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isCartOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={styles.floatingWhatsApp} 
          title="Consultar por WhatsApp"
        >
          <MessageCircle size={32} />
          <span className={styles.floatingTooltip}>¿En qué podemos ayudarte?</span>
        </button>
      )}

      <WhatsAppModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
