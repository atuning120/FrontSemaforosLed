import { Search } from 'lucide-react';
import Logo from './Logo.jsx';
import styles from './Navbar.module.css';

export default function Navbar({ searchQuery, onSearchChange }) {
  return (
    <nav className={styles.nav}>
      <div>
        <Logo size={100} showText={true} />
      </div>

      <div className={styles.navSearch}>
        <Search className={styles.navSearchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar semáforos, luminaria, cartelería vial..."
          className={styles.navInput}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </nav>
  );
}
