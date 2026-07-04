import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ProductCarousel from './components/ProductCarousel.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import ProductModal from './components/ProductModal.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import VideoSection from './components/VideoSection.jsx';
import styles from './App.module.css';

export default function App() {
  const baseCategories = ['semáforos', 'luminarias', 'cartelería vial'];
  const normalizeCategory = (value) => (value || '').trim().toLowerCase();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    let isMounted = true;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const response = await fetch(`${baseUrl}/api/productos/hogar/electronico`);
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        const mapped = data.map((item) => {
          const normalizedCategory = normalizeCategory(item.categoria || '');
          return {
            id: item.sku || String(item.id_catalogo),
            name: item.nombre || 'Producto sin nombre',
            description: item.descripcion || '',
            category: normalizedCategory || baseCategories[0],
            image: item.imagen || '/logonn-modified.png',
            images: item.imagenes || [],
            featured: Boolean(item.destacado),
            tamano_imagen: item.tamano_imagen || 'default',
            raw: item,
          };
        });

        if (isMounted) {
          setProducts(mapped);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setProductsError('No se pudieron cargar los productos.');
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    cats.add('semáforos');
    cats.add('luminarias');
    cats.add('cartelería vial');
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();

      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
        name.includes(term) || desc.includes(term)
      );

      const matchesCategory =
        activeCategory === 'Todos' || p.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const featuredProductsList = useMemo(
    () => products.filter((p) => p.featured),
    [products]
  );

  const handleQuoteWhatsApp = (product) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.farosledclean.com.ar';
    const message = `Hola! Quiero cotizar este producto:\n\n${product.name}\nSKU: ${product.id}\nLink: ${origin}`;
    const encodedMessage = encodeURIComponent(message);
    const envPhone = import.meta.env.VITE_WHATSAPP_PHONE;
    const phoneNumber = envPhone ? envPhone.trim() : '5491100000000';
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Hero />

      <ProductCarousel
        title="Productos destacados"
        subtitle="Calidad garantizada Semaforos Led"
        themeColor="var(--accent-500)"
        products={featuredProductsList}
        type="featured"
        onProductClick={setSelectedProduct}
        onQuote={handleQuoteWhatsApp}
        isPaused={!!selectedProduct}
      />

      <ProductCatalog
        filteredProducts={filteredProducts}
        loadingProducts={loadingProducts}
        productsError={productsError}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        onProductClick={setSelectedProduct}
        onQuote={handleQuoteWhatsApp}
      />

      <VideoSection />

      <Footer />

      {selectedProduct ? (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onQuote={handleQuoteWhatsApp}
        />
      ) : null}

      <WhatsAppButton />
    </div>
  );
}

