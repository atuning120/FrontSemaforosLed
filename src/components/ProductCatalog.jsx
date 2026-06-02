import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Filters from './Filters.jsx';
import ProductCard from './ProductCard.jsx';
import styles from './ProductCatalog.module.css';

export default function ProductCatalog({
  filteredProducts,
  loadingProducts,
  productsError,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  onProductClick,
  onAddToCart,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const maxButtons = 3;
  const clampedCurrent = Math.min(currentPage, totalPages);
  const startPage = Math.max(1, clampedCurrent - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  const pageStart = Math.max(1, endPage - maxButtons + 1);
  const pages = [];

  for (let page = pageStart; page <= endPage; page += 1) {
    pages.push(page);
  }

  const paginatedProducts = useMemo(() => {
    const startIndex = (clampedCurrent - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, clampedCurrent]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      const offset = 80;
      const top = catalogElement.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.catalogSection} id="catalog">
      <div className={styles.catalogHeader}>
        <div>
          <h3 className={styles.catalogTitle}>Todos los productos</h3>
          <div className={styles.catalogDivider}></div>
        </div>
        <span className={styles.catalogMeta}>
          ITEMS ENCONTRADOS: {filteredProducts.length}
        </span>

        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {loadingProducts && (
        <div className={styles.loadingMessage}>Cargando productos...</div>
      )}

      {productsError && (
        <div className={styles.errorMessage}>{productsError}</div>
      )}

      {!loadingProducts && !productsError && (
        <div className={styles.grid}>
            {paginatedProducts.map((product) => {
              const hasOffer =
                Number.isFinite(product.originalPrice) &&
                product.originalPrice > product.price;
              const discount = hasOffer
                ? Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )
                : null;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  type="default"
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                />
              );
            })}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={clampedCurrent === 1}
            onClick={() => handlePageChange(Math.max(1, clampedCurrent - 1))}
            className={styles.paginationButton}
          >
            <ChevronLeft size={16} />
            <span className={styles.hideMobile}>Anterior</span>
          </button>

          {pageStart > 1 ? (
            <>
              <button
                className={styles.paginationPageButton}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              {pageStart > 2 ? (
                <span className={styles.paginationEllipsis}>...</span>
              ) : null}
            </>
          ) : null}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.paginationPageButton} ${
                page === clampedCurrent ? styles.paginationPageActive : ''
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages ? (
            <>
              {endPage < totalPages - 1 ? (
                <span className={styles.paginationEllipsis}>...</span>
              ) : null}
              <button
                className={styles.paginationPageButton}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          ) : null}

          <button
            disabled={clampedCurrent === totalPages}
            onClick={() => handlePageChange(Math.min(totalPages, clampedCurrent + 1))}
            className={styles.paginationButton}
          >
            <span className={styles.hideMobile}>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {!loadingProducts && filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <Search size={64} />
          <p className={styles.heroSubtitle}>No se encontraron productos</p>
        </div>
      )}
    </section>
  );
}
