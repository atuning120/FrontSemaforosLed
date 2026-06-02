import { useEffect, useMemo, useState } from 'react';
import styles from './AdminOrderForm.module.css';

export default function AdminOrderForm({ baseUrl, token }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    {
      sku: '',
      quantity: 1,
      name: '',
      price: '',
      lineTotal: '',
      lineTotalManual: false,
    },
  ]);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [ivaEnabled, setIvaEnabled] = useState(true);
  const [ivaRate, setIvaRate] = useState(21);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [totalOverride, setTotalOverride] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, type: '', message: '' });

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/admin/productos/hogar/electronico`,
          { headers }
        );
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setNotice(error.message || 'Error al cargar productos');
      }
    };

    loadProducts();
  }, [baseUrl, headers]);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.sku, product]));
  }, [products]);

  const formatNumber = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    return number.toLocaleString('es-AR');
  };

  const parseNumberInput = (value) => {
    if (value === '') return '';
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : '';
  };

  const normalizedItems = items
    .map((item) => {
      const product = productMap.get(item.sku);
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price);
      const resolvedPrice = Number.isFinite(price)
        ? price
        : Number(product?.precio) || 0;
      const lineTotalValue = Number(item.lineTotal);
      const resolvedLineTotal =
        item.lineTotalManual && Number.isFinite(lineTotalValue)
          ? lineTotalValue
          : resolvedPrice * quantity;
      const adjustedPrice =
        quantity > 0 ? resolvedLineTotal / quantity : resolvedPrice;

      return {
        sku: item.sku,
        quantity,
        name: item.name || product?.nombre || '',
        price: adjustedPrice,
      };
    })
    .filter((item) => item.sku);

  const subtotal = normalizedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const ivaPercent = Number(ivaRate) || 0;
  const ivaAmount = ivaEnabled
    ? Math.ceil(subtotal * (ivaPercent / 100))
    : 0;
  const computedTotal = subtotal + ivaAmount;
  const parsedTotalOverride = Number(totalOverride);
  const hasTotalOverride =
    totalOverride !== '' && Number.isFinite(parsedTotalOverride);
  const total = hasTotalOverride ? parsedTotalOverride : computedTotal;

  const hasItems = normalizedItems.filter(item => item.quantity > 0).length > 0;
  const isCustomerNameValid = customerName.trim().length > 0;
  const cleanedPhone = customerPhone.replace(/\D/g, '');
  const isCustomerPhoneValid = cleanedPhone.length >= 10 && cleanedPhone.length <= 13;
  const isFormValid = hasItems && isCustomerNameValid && isCustomerPhoneValid;

  const handleItemChange = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (key === 'sku') {
          const product = productMap.get(value);
          return {
            ...item,
            sku: value,
            name: product?.nombre || '',
            price: product?.precio ?? '',
            lineTotal: '',
            lineTotalManual: false,
          };
        }
        if (key === 'quantity') {
          const quantity = Number(value) || 0;
          const price = Number(item.price);
          const resolvedPrice = Number.isFinite(price)
            ? price
            : Number(productMap.get(item.sku)?.precio) || 0;
          const computedLineTotal = resolvedPrice * quantity;

          return {
            ...item,
            quantity: value,
            lineTotal: computedLineTotal,
            lineTotalManual: false,
          };
        }

        if (key === 'lineTotal') {
          return {
            ...item,
            lineTotal: value,
            lineTotalManual: value !== '',
          };
        }

        return { ...item, [key]: value };
      })
    );
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        sku: '',
        quantity: 1,
        name: '',
        price: '',
        lineTotal: '',
        lineTotalManual: false,
      },
    ]);

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    const payloadItems = normalizedItems.filter((item) => item.quantity > 0);
    if (payloadItems.length === 0) {
      setModalState({ isOpen: true, type: 'error', message: 'Agrega al menos un item valido.' });
      return;
    }

    try {
      const payload = {
        items: payloadItems,
        notes,
        customer: {
          nombre: customerName,
          telefono: customerPhone,
        },
        tax: {
          enabled: ivaEnabled,
          rate: ivaPercent,
        },
      };

      if (hasTotalOverride) {
        payload.total = total;
      }

      const response = await fetch(`${baseUrl}/api/admin/ordenes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la orden. Puede que haya un problema en el backend o base de datos.');
      }
      setItems([
        {
          sku: '',
          quantity: 1,
          name: '',
          price: '',
          lineTotal: '',
          lineTotalManual: false,
        },
      ]);
      setBase64Input('');
      setResolveError('');
      setNotes('');
      setCustomerName('');
      setCustomerPhone('');
      setIvaEnabled(true);
      setIvaRate(21);
      setTotalOverride('');
      setModalState({ isOpen: true, type: 'success', message: 'Orden creada exitosamente.' });
    } catch (error) {
      setModalState({ isOpen: true, type: 'error', message: error.message || 'Error desconocido al crear la orden.' });
    }
  };

  const handleResolveBase64 = async () => {
    setResolveError('');
    setNotice('');
    if (!base64Input.trim()) {
      setResolveError('Pega el codigo base64 primero.');
      return;
    }

    const rawPayload = base64Input.trim();
    const extracted = rawPayload.match(/productos:([A-Za-z0-9+/=]+)/);
    const payload = extracted?.[1] || rawPayload;

    setIsResolving(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes/resolve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ payload }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo resolver el codigo');
      }

      const resolved = (data.items || []).map((item) => ({
        sku: item.sku,
        quantity: item.cantidad,
        name: item.nombre || '',
        price: item.precio ?? 0,
        lineTotal: '',
        lineTotalManual: false,
      }));

      if (resolved.length === 0) {
        setResolveError('No se encontraron productos validos en el codigo.');
        return;
      }

      setItems(resolved);

      if (data.telefono) {
        setCustomerPhone((prev) => prev || data.telefono);
      }

      if (Array.isArray(data.notFound) && data.notFound.length > 0) {
        setNotice(
          `Productos no encontrados: ${data.notFound
            .map((item) => String(item))
            .join(', ')}`
        );
      }
    } catch (error) {
      setResolveError(error.message || 'No se pudo resolver el codigo');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h2>Nueva orden de compra</h2>
        <div className={styles.orderBlock}>
          <h3 className={styles.orderBlockTitle}>Codigo del carrito</h3>
          <div className={styles.formGrid}>
            <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
              (desde WhatsApp)
              <textarea
                value={base64Input}
                onChange={(event) => setBase64Input(event.target.value)}
                rows={3}
                className={styles.textarea}
                placeholder="Pega aqui el codigo ..."
              />
            </label>
            <div className={styles.orderInlineActions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={handleResolveBase64}
                disabled={isResolving}
              >
                {isResolving ? 'Resolviendo...' : 'Convertir codigo'}
              </button>
            </div>
            {resolveError ? <p className={styles.error}>{resolveError}</p> : null}
          </div>
        </div>

        <div className={styles.orderBlock}>
          <h3 className={styles.orderBlockTitle}>Datos del cliente</h3>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              <span>Nombre del cliente <span style={{ color: '#f97316' }}>*</span></span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className={styles.input}
                placeholder="Nombre y apellido"
              />
            </label>
            <label className={styles.label}>
              <span>Telefono del cliente <span style={{ color: '#f97316' }}>*</span></span>
              <input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className={styles.input}
                placeholder="Ej: +54 9 11 1234 5678"
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.orderBlock}>
            <h3 className={styles.orderBlockTitle}>
              Items de la orden <span style={{ color: '#f97316' }}>*</span>
            </h3>
            <div className={styles.orderItems}>
              <div className={styles.orderRowHeader}>
                <span className={styles.orderHeaderCell}>
                  Producto
                </span>
                <span className={styles.orderHeaderCell}>
                  Cantidad
                </span>
                <span className={styles.orderHeaderCell}>
                  Precio unitario
                </span>
                <span className={styles.orderHeaderCell}>
                  Total item
                </span>
                <span className={styles.orderHeaderCell}>
                  Acciones
                </span>
              </div>
              {items.map((item, index) => (
                <div key={`${item.sku}-${index}`} className={styles.orderRow}>
                  {(() => {
                    const product = productMap.get(item.sku);
                    const quantity = Number(item.quantity) || 0;
                    const price = Number(item.price);
                    const resolvedPrice = Number.isFinite(price)
                      ? price
                      : Number(product?.precio) || 0;
                    const lineTotalValue = Number(item.lineTotal);
                    const resolvedLineTotal =
                      item.lineTotalManual && Number.isFinite(lineTotalValue)
                        ? lineTotalValue
                        : resolvedPrice * quantity;

                    return (
                      <>
                        <select
                          value={item.sku}
                          onChange={(event) =>
                            handleItemChange(index, 'sku', event.target.value)
                          }
                          className={styles.input}
                        >
                          <option value="">Seleccionar producto</option>
                          {products.map((product) => (
                            <option key={product.sku} value={product.sku}>
                              {product.nombre} ({product.sku})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumber(item.quantity)}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              'quantity',
                              parseNumberInput(event.target.value)
                            )
                          }
                          className={`${styles.input} ${styles.orderQuantityInput}`}
                        />
                        <div className={styles.priceInputWrap} style={{ justifyContent: 'center' }}>
                          <span className={styles.pricePrefix}>$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={formatNumber(resolvedPrice)}
                            style={{
                              opacity: 0.7,
                              fontWeight: 'normal',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: 'var(--text)',
                              fontSize: '1rem',
                              width: '80px',
                              textAlign: 'center'
                            }}
                            placeholder="Precio unitario"
                            disabled
                          />
                        </div>
                        <div className={styles.priceInputWrap}>
                          <span className={styles.pricePrefix}>$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              item.lineTotalManual
                                ? formatNumber(item.lineTotal)
                                : formatNumber(resolvedLineTotal)
                            }
                            onChange={(event) =>
                              handleItemChange(
                                index,
                                'lineTotal',
                                parseNumberInput(event.target.value)
                              )
                            }
                            className={styles.input}
                            placeholder="Total item"
                            style={{ fontWeight: 'bold', width: '100px' }}
                          />
                        </div>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          Quitar
                        </button>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>

            <button type="button" className={styles.secondary} onClick={addItem}>
              Agregar item
            </button>
          </div>

          <div className={styles.orderSideBySide}>
            <div className={`${styles.orderBlock} ${styles.orderNotesBlock}`}>
              <h3 className={styles.orderBlockTitle}>Notas e impuestos</h3>
              <label className={styles.label}>
                Notas
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className={styles.textarea}
                />
              </label>

              <div className={styles.orderInlineActions}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={ivaEnabled}
                    onChange={(event) => setIvaEnabled(event.target.checked)}
                  />
                  Aplicar IVA
                </label>
                <label className={styles.label}>
                  IVA (%)
                  <input
                    type="number"
                    min="0"
                    value={ivaRate}
                    onChange={(event) => setIvaRate(event.target.value)}
                    className={styles.input}
                    disabled={!ivaEnabled}
                  />
                </label>
              </div>
            </div>

            <div className={`${styles.orderBlock} ${styles.orderSummaryBlock}`}>
              <h3 className={styles.orderBlockTitle}>Resumen</h3>
              <div className={styles.orderSummary}>
                <span>Subtotal</span>
                <strong>${formatNumber(subtotal)}</strong>
              </div>
              <div className={styles.orderSummary}>
                <span>IVA</span>
                <strong>${formatNumber(ivaAmount)}</strong>
              </div>
              <div className={styles.orderSummary}>
                <span>Total</span>
                <div className={styles.priceInputWrap}>
                  <span className={styles.pricePrefix} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      hasTotalOverride
                        ? formatNumber(totalOverride)
                        : formatNumber(computedTotal)
                    }
                    onChange={(event) =>
                      setTotalOverride(parseNumberInput(event.target.value))
                    }
                    className={styles.input}
                    style={{ fontWeight: 'bold', fontSize: '1.1rem', width: '140px', color: 'var(--accent-400)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={styles.primary}
            style={{ marginTop: '2.5rem' }}
            disabled={!isFormValid}
          >
            Crear orden
          </button>
        </form>
        {notice ? <p className={styles.notice}>{notice}</p> : null}
      </div>

      {modalState.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {modalState.type === 'error' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '4rem', height: '4rem', margin: '0 auto' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '4rem', height: '4rem', margin: '0 auto' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            <h3 className={modalState.type === 'error' ? styles.modalError : styles.modalSuccess}>
              {modalState.type === 'error' ? 'Error al crear' : 'Operación exitosa'}
            </h3>
            <p className={styles.modalMessage}>{modalState.message}</p>
            <button
              className={styles.primary}
              onClick={() => setModalState({ isOpen: false, type: '', message: '' })}
              style={{ marginTop: '1rem' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
