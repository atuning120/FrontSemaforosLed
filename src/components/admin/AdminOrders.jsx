import { useEffect, useMemo, useState } from 'react';
import styles from './AdminOrders.module.css';

export default function AdminOrders({ baseUrl, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes`, { headers });
      if (!response.ok) {
        throw new Error('Error al cargar ordenes');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error al cargar ordenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdatingId(selectedOrder._id);

    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      const updatedOrder = await response.json();

      setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
    } catch (err) {
      alert(err.message || 'Error al actualizar estado');
    } finally {
      setUpdatingId('');
    }
  };

  const friendlyDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== 'Todos') {
      result = result.filter(order => {
        const currentStatus = (order.status || 'Pendiente').trim().toLowerCase();
        return currentStatus === statusFilter.trim().toLowerCase();
      });
    }

    if (!searchTerm.trim()) return result;

    let regex;
    try {
      regex = new RegExp(searchTerm.trim(), 'i');
    } catch (e) {
      regex = new RegExp(searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    return result.filter(order => {
      const idMatch = regex.test(order._id);
      const nameMatch = order.customer?.nombre && regex.test(order.customer.nombre);
      const phoneMatch = order.customer?.telefono && regex.test(order.customer.telefono);
      return idMatch || nameMatch || phoneMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pagado': return styles.statusPagado;
      case 'Entregado': return styles.statusEntregado;
      default: return styles.statusPendiente;
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.cardHeader} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Ordenes de compra</h2>
            <button type="button" className={styles.secondary} onClick={loadOrders}>
              Recargar
            </button>
          </div>

          <div className={styles.filterContainer}>
            <div className={styles.categoryList}>
              {['Todos', 'Pendiente', 'Pagado', 'Entregado'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`${styles.categoryButton} ${statusFilter === status ? styles.categoryButtonActive : ''
                    }`}
                >
                  {status === 'Todos' ? 'TODOS' : status.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.searchWrap}>
              <input
                type="text"
                placeholder="Buscar por ID, cliente o teléfono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.selectInput}
                style={{ width: '100%', borderRadius: '1.5rem', padding: '0.75rem 1rem' }}
              />
            </div>
          </div>
        </div>

        {loading ? <p>Cargando...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {!loading && orders.length === 0 ? <p>No hay ordenes.</p> : null}

        <div className={styles.ordersGrid}>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={styles.orderCard}
              onClick={() => handleOrderClick(order)}
            >
              <div className={styles.orderHeader}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                    {friendlyDate(order.createdAt)}
                  </p>
                </div>
                <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                  {order.status || 'Pendiente'}
                </span>
              </div>
              <div className={styles.orderTotal} style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                ${Number(order.total || 0).toLocaleString('es-AR')}
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                {order.items?.length || 0} ítems
              </p>
              {order.customer?.nombre && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                  Cliente: {order.customer.nombre} <br />
                  Tel: {order.customer.telefono || 'N/A'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeOrderModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={closeOrderModal}>×</button>

            <h2 style={{ margin: '0 0 1rem' }}>
              Orden #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
            </h2>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <strong style={{ color: 'var(--accent-400)' }}>Fecha</strong>
                <p style={{ margin: '0.2rem 0 0' }}>{friendlyDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--accent-400)' }}>Estado</strong>
                <select
                  className={styles.selectInput}
                  value={selectedOrder.status || 'Pendiente'}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={updatingId === selectedOrder._id}
                  style={{ marginTop: '0.2rem', padding: '0.4rem 0.8rem' }}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Datos del cliente</h3>
              <p style={{ margin: '0 0 0.2rem' }}><strong>Nombre:</strong> {selectedOrder.customer?.nombre || 'N/A'}</p>
              <p style={{ margin: 0 }}><strong>Teléfono:</strong> {selectedOrder.customer?.telefono || 'N/A'}</p>
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Ítems ({selectedOrder.items?.length || 0})</h3>
              <ul className={styles.orderListItems} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '1rem' }}>
                {selectedOrder.items?.map((item, index) => (
                  <li key={`${selectedOrder._id}-${index}`} style={{ padding: '0.2rem 0' }}>
                    <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{item.name || item.sku}</strong>
                    <br />
                    <span style={{ fontSize: '0.9rem' }}>{item.quantity} x ${Number(item.price).toLocaleString('es-AR')}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedOrder.notes && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Notas e impuestos</h3>
                <p className={styles.orderNotes} style={{ margin: 0, padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                  {selectedOrder.notes}
                  {selectedOrder.tax?.enabled && ` (IVA aplicado: ${selectedOrder.tax.rate}%)`}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total Final</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-400)' }}>
                ${Number(selectedOrder.total || 0).toLocaleString('es-AR')}
              </span>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
