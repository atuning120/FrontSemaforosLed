import { useEffect, useMemo, useState } from 'react';

import { motion, AnimatePresence } from 'motion/react';
import Cart from './components/Cart.jsx';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ProductCarousel from './components/ProductCarousel.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import InfoSection from './components/InfoSection.jsx';
import ProductModal from './components/ProductModal.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Toast from './components/Toast.jsx';
import styles from './App.module.css';

export default function App() {
  const baseCategories = ['iluminacion', 'ferreteria', 'limpieza'];
  const normalizeCategory = (value) => (value || '').trim().toLowerCase();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [toast, setToast] = useState(null);

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
          const price = Number.isFinite(item.precio) ? item.precio : 0;
          const discountPercent = Number(item.porcentaje_oferta || 0);
          const isOffer = Boolean(item.en_oferta) && discountPercent > 0;
          const originalPrice =
            isOffer && discountPercent < 100 && price > 0
              ? Math.round(price / (1 - discountPercent / 100))
              : undefined;

          return {
            id: item.sku || String(item.id_catalogo),
            name: item.nombre || 'Producto sin nombre',
            description: item.descripcion || '',
            price,
            originalPrice,
            category: normalizedCategory || baseCategories[0],
            image: item.imagen || '/logonn-modified.png',
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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (isCartOpen) {
      setToast(null);
    }
  }, [isCartOpen]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    cats.add('limpieza');
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

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const offerProducts = useMemo(
    () => products.filter((p) => p.originalPrice && p.originalPrice > p.price),
    [products]
  );

  const featuredProductsList = useMemo(
    () => products.filter((p) => p.featured),
    [products]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setToast({ id: Date.now(), productName: product.name });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <div className={styles.page}>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartOpen={setIsCartOpen}
        cartCount={cartCount}
      />

      <Hero />

      <InfoSection />

      <ProductCarousel
        id="offers-section"
        title="Ofertas imperdibles"
        subtitle="Precios exclusivos web"
        icon="🔥"
        themeColor="#dc2626"
        products={offerProducts}
        type="offer"
        onProductClick={setSelectedProduct}
        onAddToCart={addToCart}
        isPaused={!!selectedProduct}
      />

      <ProductCarousel
        title="Productos destacados"
        subtitle="Calidad garantizada LED CLEAN"
        themeColor="var(--accent-500)"
        products={featuredProductsList}
        type="featured"
        onProductClick={setSelectedProduct}
        onAddToCart={addToCart}
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
        onAddToCart={addToCart}
      />

      <Footer />

      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />

      {selectedProduct ? (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      ) : null}

      <WhatsAppButton isCartOpen={isCartOpen} />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

