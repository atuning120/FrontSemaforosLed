import { Search } from 'lucide-react';
import styles from './Filters.module.css';

export default function Filters({
  searchQuery,
  setSearchQuery,
  filterCategories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.categoryList}>
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${styles.categoryButton} ${
              activeCategory === cat ? styles.categoryButtonActive : ''
            }`}
          >
            {cat === 'Todos' ? 'TODOS' : cat}
          </button>
        ))}
      </div>

      <div className={styles.searchWrap}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar cables, reflectores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
}
