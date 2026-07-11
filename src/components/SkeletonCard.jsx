import styles from './SkeletonCard.module.css';

export default function SkeletonCard({ isCarousel = false }) {
  return (
    <div className={`${styles.skeleton} ${isCarousel ? styles.carouselSkeleton : ''}`}>
      <div className={`${styles.mediaSkeleton} ${styles.shimmer}`}></div>
      <div className={styles.contentSkeleton}>
        <div className={`${styles.tagSkeleton} ${styles.shimmer}`}></div>
        <div className={`${styles.titleSkeleton} ${styles.shimmer}`}></div>
        <div className={`${styles.textSkeleton} ${styles.shimmer}`}></div>
        <div className={`${styles.textSkeletonShort} ${styles.shimmer}`}></div>
        <div className={`${styles.buttonSkeleton} ${styles.shimmer}`}></div>
      </div>
    </div>
  );
}
