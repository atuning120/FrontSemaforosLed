import React from 'react';
import styles from './VideoSection.module.css';

export default function VideoSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nuestros Equipos en Acción</h2>
          <p className={styles.subtitle}>
            Conoce más sobre la calidad y funcionamiento de nuestra tecnología LED para seguridad vial.
          </p>
        </div>
        <div className={styles.videoGrid}>
          {/* Video 1 */}
          <div className={styles.videoWrapper}>
            <iframe 
              src="https://www.youtube.com/embed/XWsU_xWFFDc" 
              title="Semáforos LED Argentina - Video 1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          {/* Video 2 */}
          <div className={styles.videoWrapper}>
            <iframe 
              src="https://www.youtube.com/embed/7YIYq1PwWBk" 
              title="Semáforos LED Argentina - Video 2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
