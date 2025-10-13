import { useTiendaAuth } from '../stores/tiendaAuth';
import { useTiendaProductos } from '../stores/tiendaProductos';
import { useTiendaCarrito } from '../stores/tiendaCarrito';

export default function AdminDebugPanel() {
  const auth = useTiendaAuth((s) => ({ cargando: s.cargando, usuario: s.usuario }));
  const productos = useTiendaProductos((s) => ({ cargando: s.cargando, categoria: s.categoriaSeleccionada }));
  const carrito = useTiendaCarrito((s) => ({ cargando: s.cargando, total: s.obtenerTotalArticulos() }));

  return (
    <div className="fixed right-4 bottom-4 z-50 p-3 bg-white dark:bg-gray-800 border rounded shadow text-xs w-64">
      <div className="font-semibold mb-2">Admin Debug</div>
      <div className="mb-1">Auth cargando: <b>{String(auth.cargando)}</b></div>
      <div className="mb-1">Auth user: <b>{auth.usuario?.email ?? '—'}</b></div>
      <div className="mb-1">Productos cargando: <b>{String(productos.cargando)}</b></div>
      <div className="mb-1">Categoria sel: <b>{productos.categoria ?? '—'}</b></div>
      <div className="mb-1">Carrito cargando: <b>{String(carrito.cargando)}</b></div>
      <div className="mb-1">Carrito items: <b>{carrito.total}</b></div>
      <div className="mt-2 text-xxs text-gray-500">(temporal - ocultar en producción)</div>
    </div>
  );
}
