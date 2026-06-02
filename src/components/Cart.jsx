import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import styles from './Cart.module.css';

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '';

export default function Cart({
  isCartOpen,
  setIsCartOpen,
  cart,
  cartCount,
  cartTotal,
  removeFromCart,
  updateQuantity,
}) {
  const [error, setError] = useState('');

  const productPayload = useMemo(
    () =>
      cart.map((item) => ({
        idproducto: item.raw?.sku || item.id,
        cantidad: item.quantity,
      })),
    [cart]
  );

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const formatPrice = (value) => Number(value || 0).toLocaleString('es-AR');

  const buildMessage = () => {
    const productLines = cart.map((item) => {
      const percentage = Number(item.raw?.porcentaje_oferta || 0);
      const hasDiscount = Boolean(item.raw?.en_oferta) && percentage > 0;
      const currentPrice = formatPrice(item.price);
      const previousPrice = hasDiscount
        ? formatPrice(Math.round(item.price / (1 - percentage / 100)))
        : null;
      const priceLabel = hasDiscount
        ? `$${currentPrice}, antes $${previousPrice}`
        : `$${currentPrice}`;

      return `- ${item.quantity}x ${item.name} (${priceLabel})`;
    });

    const payload = btoa(
      unescape(encodeURIComponent(JSON.stringify(productPayload)))
    );

    return [
      '*Nuevo Pedido desde la Web*',
      '*Productos*',
      ...productLines,
      `*Total: $${formatPrice(cartTotal)}*`,
      '',
      `productos:${payload}`,
    ].join('\n');
  };

  const handleWhatsAppOrder = () => {
    setError('');
    if (!WHATSAPP_PHONE) {
      setError('Falta configurar el numero de WhatsApp.');
      return;
    }
    if (cart.length === 0) {
      setError('Agrega productos antes de enviar.');
      return;
    }

    const message = buildMessage();
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className={styles.cartOverlay}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className={styles.cart}
          >
            <div className={styles.header}>
              <div>
                <h4>Tu Orden</h4>
                <p>{cartCount} Artículos en revisión</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
                <X className={styles.icon} />
              </button>
            </div>

            <div className={styles.items}>
              {cart.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyRing}>
                    <ShoppingCart className={styles.icon} />
                  </div>
                  <p>Orden Vacía</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.thumb}>
                      <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                    </div>
                    <div className={styles.info}>
                      <div className={styles.title}>
                        <span>{item.name}</span>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Quitar">
                          <Trash2 className={styles.icon} />
                        </button>
                      </div>
                      <div className={styles.price}>
                        ${item.price.toLocaleString()}
                      </div>
                      <div className={styles.qty}>
                        <button onClick={() => updateQuantity(item.id, -1)} aria-label="Restar">
                          <Minus className={styles.icon} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} aria-label="Sumar">
                          <Plus className={styles.icon} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className={styles.summary}>
                {error ? <div className={styles.error}>{error}</div> : null}
                <div className={styles.total}>
                  <span>Monto Total</span>
                  <strong>${cartTotal.toLocaleString()}</strong>
                </div>
                <div className={styles.checkout}>
                  <button onClick={handleWhatsAppOrder}>
                    <span>Enviar pedido</span>
                    <strong>WhatsApp</strong>
                  </button>
                  <p>El pedido se enviara al WhatsApp.</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
