import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa';
import styles from './Footer.module.css';
import ContactPopover from './ContactPopover';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h4>
              SEMAFOROS <span>LED</span>
            </h4>
            <p>
              Empresa especializada en la importación y distribución técnica de componentes
              eléctricos. Soluciones integrales para proyectos de gran escala.
            </p>

            <div className={styles.social}>
              <a href="https://www.instagram.com/semaforosled1978/" title="Instagram">
                <FaInstagram className={styles.icon} />
              </a>
              <a href="https://www.youtube.com/watch?v=7YIYq1PwWBk" title="YouTube">
                <FaYoutube className={styles.icon} />
              </a>
              <a href="https://web.facebook.com/semaforosledargentina?_rdc=1&_rdr#" title="Facebook">
                <FaFacebookF className={styles.icon} />
              </a>
            </div>

          </div>

          <div className={styles.contact}>
            <h5>Central de Contacto</h5>
            <div className={styles.columns}>
              <ul>
                <li>
                  <ContactPopover
                    targetEmail={import.meta.env.VITE_EMAIL || 'ventas@ledclean.ar'}
                    buttonContent={
                      <div className={styles.contactCard} style={{ textDecoration: 'none' }}>
                        <div className={`${styles.iconContainer} ${styles.isAccent}`}>
                          <Mail className={styles.icon} />
                        </div>
                        <div>
                          <span>Email Corporativo</span>
                          <strong style={{ textTransform: 'lowercase' }}>{import.meta.env.VITE_EMAIL || 'ventas@ledclean.ar'}</strong>
                        </div>
                      </div>
                    }
                  />
                </li>
              </ul>
              <ul>
                <li>
                  <ContactPopover
                    targetEmail={import.meta.env.VITE_CONSULTAS_EMAIL || 'consultas@ledclean.ar'}
                    buttonContent={
                      <div className={styles.contactCard} style={{ textDecoration: 'none' }}>
                        <div className={`${styles.iconContainer} ${styles.isAccent}`}>
                          <Mail className={styles.icon} />
                        </div>
                        <div>
                          <span>Consultas y Ayuda</span>
                          <strong style={{ textTransform: 'lowercase' }}>{import.meta.env.VITE_CONSULTAS_EMAIL || 'consultas@ledclean.ar'}</strong>
                        </div>
                      </div>
                    }
                  />
                </li>
              </ul>
              <ul>
                <li className={styles.contactCard}>
                  <div className={`${styles.iconContainer} ${styles.isGreen}`}>
                    <MessageCircle className={styles.icon} />
                  </div>
                  <div>
                    <span>WhatsApp Soporte</span>
                    <strong>+{import.meta.env.VITE_WHATSAPP_PHONE}</strong>
                  </div>
                </li>
              </ul>
              <ul>
                <li className={styles.contactCard}>
                  <div className={`${styles.iconContainer} ${styles.isGreen}`}>
                    <MessageCircle className={styles.icon} />
                  </div>
                  <div>
                    <span>WhatsApp Comercial</span>
                    <strong>+{import.meta.env.VITE_WHATSAPP_SECOND}</strong>
                  </div>
                </li>
              </ul>
              <ul>
                <li className={styles.contactCard}>
                  <div className={`${styles.iconContainer} ${styles.isAccent}`}>
                    <MapPin className={styles.icon} />
                  </div>
                  <div>
                    <span>Ubicacion</span>
                    <strong>{import.meta.env.VITE_STORE_ADDRESS || 'Maipú 942 Este, San Juan, Argentina'}</strong>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyrightSection}>
            <p>&copy; 2026 Semaforos Led. TRABAJAMOS CON LOS MEJORES.</p>
            <div className={styles.developedBy}>
              Desarrollado por
              <a href="https://github.com/atuning120" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
                <FaGithub className={styles.githubIcon} />
                atuning120
              </a>
            </div>
          </div>
          <span>PAGOS PROCESADOS POR MERCADO PAGO</span>
        </div>
      </div>
    </footer>
  );
}