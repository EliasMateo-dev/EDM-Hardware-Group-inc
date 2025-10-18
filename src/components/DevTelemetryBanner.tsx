import { useCallback, useMemo } from 'react';
import { useTiendaProductos } from '../stores/tiendaProductos';
import { useTiendaCarrito } from '../stores/tiendaCarrito';

export default function DevTelemetryBanner() {
  // Solo renderizar en desarrollo
  // Vite define import.meta.env.DEV en dev. Esta es una protección para otros bundlers.
  // @ts-ignore
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return null;

  const productosState = useTiendaProductos((s) => ({
    cargando: s.cargando,
    lastError: s.lastError,
    count: s.productos ? s.productos.length : 0,
  }));

  // Calcular valores derivados dentro del selector a partir del estado crudo
  // para evitar invocar métodos del store que llamen a getState() y provoquen
  // actualizaciones anidadas durante render/efectos.
  const carritoState = useTiendaCarrito((s) => {
    const count = (s.elementos || []).reduce((acc, el) => acc + (el?.cantidad || 0), 0);
    const total = (s.elementos || []).reduce((acc, el) => acc + ((el?.producto?.price || 0) * (el?.cantidad || 0)), 0);
    return { count, total, elementos: s.elementos };
  });

  const payload = useMemo(() => ({
    productos: productosState,
    carrito: carritoState,
    timestamp: new Date().toISOString(),
  }), [productosState, carritoState]);

  const copyDebug = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  // indicación visual de esfuerzo (best-effort)
      // eslint-disable-next-line no-alert
      alert('Debug info copiada al portapapeles');
    } catch (err) {
      console.error('copy debug failed', err);
      // eslint-disable-next-line no-alert
      alert('No se pudo copiar el debug (revisa la consola)');
    }
  }, [payload]);

  const clearLastError = useTiendaProductos((s) => s.clearLastError);

  return (
    <div className="fixed right-4 bottom-4 z-50 w-80 bg-white/90 dark:bg-gray-800/90 border rounded shadow p-3 text-sm text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-2">
        <strong className="text-xs">Dev Telemetry</strong>
        <div className="flex gap-2">
          <button
            onClick={copyDebug}
            className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs"
          >
            Copiar
          </button>
          <button
            onClick={() => clearLastError()}
            className="px-2 py-0.5 bg-amber-600 text-white rounded text-xs"
          >
            ClearErr
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between"><span className="text-xs">productos.cargando</span><span className="font-mono text-xs">{String(productosState.cargando)}</span></div>
        <div className="flex justify-between"><span className="text-xs">productos.count</span><span className="font-mono text-xs">{productosState.count}</span></div>
        <div className="flex justify-between"><span className="text-xs">productos.lastError</span><span className="font-mono text-xs">{productosState.lastError ?? '-'}</span></div>
        <hr className="my-1 border-dashed" />
        <div className="flex justify-between"><span className="text-xs">carrito.items</span><span className="font-mono text-xs">{carritoState.count}</span></div>
        <div className="flex justify-between"><span className="text-xs">carrito.total</span><span className="font-mono text-xs">{carritoState.total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}
