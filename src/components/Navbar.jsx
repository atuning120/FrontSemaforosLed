import { ShoppingCart, Search } from 'lucide-react';
import Logo from './Logo.jsx';
import styles from './Navbar.module.css';

export default function Navbar({ searchQuery, onSearchChange, onCartOpen, cartCount }) {
  return (
    <nav className={styles.nav}>
      <div>
        <Logo size={85} showText={true} />
      </div>

      <div className={styles.navSearch}>
        <Search className={styles.navSearchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar reflectores, focos, herramientas..."
          className={styles.navInput}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.navActions}>
        <button
          onClick={() => onCartOpen(true)}
          className={styles.cartButton}
        >
          <ShoppingCart size={28} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}
