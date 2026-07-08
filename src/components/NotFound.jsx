import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from '../App.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <Navbar
        searchQuery=""
        onSearchChange={() => {}}
        onCartOpen={() => {}}
        cartCount={0}
      />
      
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '6rem', color: '#dc2626', marginBottom: '1rem', fontWeight: 'bold' }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Página no encontrada</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
          Lo sentimos, la ruta que intentas visitar no existe o no tienes acceso.
        </p>
        <Link to="/" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          Volver al catálogo
        </Link>
      </div>

      <Footer />
    </div>
  );
}
