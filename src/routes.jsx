import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import AdminApp from './components/admin/AdminApp.jsx';
import NotFound from './components/NotFound.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Redirecciones para URLs antiguas de WooCommerce / WordPress a la raíz (SEO y UX) */}
        <Route path="/categoria-producto/*" element={<Navigate to="/" replace />} />
        <Route path="/producto/*" element={<Navigate to="/" replace />} />
        <Route path="/categoria/*" element={<Navigate to="/" replace />} />
        <Route path="/shop/*" element={<Navigate to="/" replace />} />
        <Route path="/tienda/*" element={<Navigate to="/" replace />} />
        <Route path="/product-category/*" element={<Navigate to="/" replace />} />
        <Route path="/semaforos/*" element={<Navigate to="/" replace />} />
        <Route path="/luminarias/*" element={<Navigate to="/" replace />} />
        <Route path="/home/*" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/store/*" element={<Navigate to="/" replace />} />
        <Route path="/store" element={<Navigate to="/" replace />} />
        <Route path="/productos/*" element={<Navigate to="/" replace />} />
        <Route path="/productos" element={<Navigate to="/" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

