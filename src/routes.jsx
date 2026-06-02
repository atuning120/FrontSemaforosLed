import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AdminApp from './components/admin/AdminApp.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
