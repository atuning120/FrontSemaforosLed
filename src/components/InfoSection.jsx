import { ClipboardList, ShoppingCart, MessageCircle, CreditCard, PackageCheck } from 'lucide-react';
import styles from './InfoSection.module.css';

export default function InfoSection() {
  const steps = [
    { icon: ClipboardList, title: '1. COTIZA', sub: 'REVISA EL CATÁLOGO' },
    { icon: ShoppingCart, title: '2. ARMA TU CARRITO', sub: 'AGREGA LOS PRODUCTOS QUE NECESITAS' },
    { icon: MessageCircle, title: '3. WHATSAPP', sub: 'CONFIRMA DETALLES' },
    { icon: CreditCard, title: '4. PAGA', sub: 'MERCADO PAGO O TRANSFERENCIA' },
    { icon: PackageCheck, title: '5. RETIRA O RECIBE', sub: 'EN SUCURSAL O ENVÍO A TODO EL PAÍS' },
  ];

  return (
    <section className={styles.infoSection}>
      <div className={styles.infoPanel}>
        <h5 className={styles.infoColumnTitle}>CÓMO COMPRAR</h5>
        <div className={styles.timelineContainer}>
          {steps.map((item, idx) => (
            <div key={idx} className={styles.timelineItem}>
              <div className={styles.infoIcon}>
                <item.icon size={24} />
              </div>
              <div className={styles.timelineContent}>
                <h6 className={styles.infoTitle}>{item.title}</h6>
                <p className={styles.infoSubtitle}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
