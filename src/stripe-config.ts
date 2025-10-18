// Configuración de productos Stripe
export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

// Productos de hardware disponibles para compra
export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_hardware_components', // Reemplazar con tu price ID real de Stripe
    name: 'Componentes de Hardware',
    description: 'Compra de componentes de PC seleccionados',
    price: 0, // Se calculará dinámicamente
    currency: 'ars',
    mode: 'payment'
  }
];

// Función para crear un payload de producto dinámico y convertir ARS a USD usando dolarapi.com
export const createDynamicProduct = async (items: any[], totalAmount: number) => {
  const endpoint = 'https://dolarapi.com/v1/dolares/oficial';
  const fallbackRate = Number(import.meta.env.VITE_USD_FALLBACK) || 350; // ARS per USD
  let rate = fallbackRate;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
  // La API puede devolver un objeto o un array — manejamos ambos casos
      const info = Array.isArray(data) ? (data[0] || {}) : data || {};
      const venta = info.venta ?? info.valor ?? info.value ?? null;
      const parsed = Number(venta);
      if (!isNaN(parsed) && parsed > 0) rate = parsed;
    } else {
      console.warn('[createDynamicProduct] failed to fetch rate, using fallback', res.status);
    }
  } catch (err) {
    console.warn('[createDynamicProduct] error fetching rate, using fallback', err);
  }

  // Construir montos por ítem en USD (Stripe espera valores en centavos)
  const itemsUsd = items.map((item: any) => {
    const prod = item.producto || {};
    const arsUnit = Number(prod.price || prod.precio || 0);
    const usdUnitCents = Math.max(1, Math.round((arsUnit / rate) * 100));
    return {
      name: prod.name || prod.nombre || 'Producto',
      unit_amount: usdUnitCents,
      quantity: Number(item.cantidad || 1),
      original_ars: arsUnit,
    };
  });

  const totalUsdCents = itemsUsd.reduce((s: number, it: any) => s + (it.unit_amount * it.quantity), 0);

  return {
    priceId: 'price_hardware_components',
    name: `Compra EDM Hardware - ${items.length} producto${items.length > 1 ? 's' : ''}`,
    description: items.map((item) => {
      const prod = item.producto || {};
      return `${prod.name || prod.nombre || 'Producto'} x${item.cantidad}`;
    }).join(', '),
    price: totalUsdCents,
    currency: 'usd',
    mode: 'payment',
    rate,
    items: itemsUsd,
    totalUsdCents,
  };
};

// Función auxiliar para obtener el producto por price ID
export const getProductByPriceId = (priceId: string) => 
  stripeProducts.find(product => product.priceId === priceId);