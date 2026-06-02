import styles from './Logo.module.css';

export default function Logo({ size = 44, showText = false }) {
  return (
    <div className={styles.logo}>
      <img
        src="/LogoSemaforosLedOriginalFondoSin.png"
        alt="Semaforos Led"
        className={styles.image}
        style={{ width: size, height: size }}
      />
      {showText ? (
        <span className={styles.text}>
          SEMAFOROS <span className={styles.textAccent}>LED</span>
        </span>
      ) : null}
    </div>
  );
}
