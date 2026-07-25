import { useMemo, useState, useEffect } from 'react';
import { Package, Image as ImageIcon, Settings, LogOut, Loader2, Menu } from 'lucide-react';
import AdminLogin from './AdminLogin.jsx';
import AdminProducts from './AdminProducts.jsx';
import AdminSettings from './AdminSettings.jsx';
import AdminHero from './AdminHero.jsx';
import styles from './AdminApp.module.css';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const VIEWS = [
  { key: 'products', label: 'Productos', icon: Package },
  { key: 'hero', label: 'Banner', icon: ImageIcon },
  { key: 'settings', label: 'Configuración', icon: Settings },
];

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [view, setView] = useState('products');
  const [isValidating, setIsValidating] = useState(!!token);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${BASE_URL}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          localStorage.removeItem('adminToken');
          setToken('');
        }
      } catch (error) {
        console.error('Error verificando el token', error);
      } finally {
        setIsValidating(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleLogin = (nextToken) => {
    localStorage.setItem('adminToken', nextToken);
    setToken(nextToken);
    setView('products');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
  };

  const viewLabel = useMemo(
    () => VIEWS.find((item) => item.key === view)?.label || '',
    [view]
  );

  if (isValidating) {
    return (
      <div className={styles.adminLoading}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  if (!token) {
    return <AdminLogin baseUrl={BASE_URL} onSuccess={handleLogin} />;
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!isSidebarCollapsed && (
            <div className={styles.sidebarTitle}>
              <h2>SEMAFOROS <span>LED</span></h2>
              <p>Panel de Control</p>
            </div>
          )}
          <button 
            className={styles.collapseBtn} 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expandir" : "Contraer"}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {VIEWS.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setView(item.key)}
                className={`${styles.navButton} ${isActive ? styles.navButtonActive : ''}`}
                title={item.label}
              >
                <Icon className={styles.navIcon} size={20} />
                {!isSidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logout} onClick={handleLogout} title="Cerrar Sesión">
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <p className={styles.eyebrow}>Panel administrador</p>
            <h1>{viewLabel}</h1>
          </div>
        </header>

        <main className={styles.main}>
          <div className={`${styles.mainInner} ${view === 'hero' ? styles.mainInnerFull : ''}`}>
            {view === 'products' && (
              <AdminProducts baseUrl={BASE_URL} token={token} />
            )}
            {view === 'hero' && (
              <AdminHero baseUrl={BASE_URL} token={token} />
            )}
            {view === 'settings' && (
              <AdminSettings baseUrl={BASE_URL} token={token} onCredentialsUpdated={handleLogin} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {VIEWS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`${styles.mobileNavButton} ${isActive ? styles.mobileNavButtonActive : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button type="button" className={styles.mobileNavButton} onClick={handleLogout}>
          <LogOut size={22} />
          <span>Salir</span>
        </button>
      </nav>
    </div>
  );
}
