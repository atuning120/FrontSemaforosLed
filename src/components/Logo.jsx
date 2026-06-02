import styles from './Logo.module.css';

export default function Logo({ size = 44, showText = false }) {
  return (
    <div className={styles.logo}>
      <img
        src="/logonn-modified.png"
        alt="LED Clean"
        className={styles.image}
        style={{ width: size, height: size }}
      />
      {showText ? (
        <span className={styles.text}>
          LED <span className={styles.textAccent}>CLEAN</span>
        </span>
      ) : null}
    </div>
  );
}
