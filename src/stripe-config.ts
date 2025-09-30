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

// Función para crear un producto dinámico basado en el carrito
export const createDynamicProduct = (items: any[], totalAmount: number): StripeProduct => ({
  priceId: 'price_hardware_components', // Usar un price ID genérico
  name: `Compra EDM Hardware - ${items.length} producto${items.length > 1 ? 's' : ''}`,
  description: items.map(item => `${item.producto.nombre} x${item.cantidad}`).join(', '),
  price: totalAmount,
  currency: 'ars',
  mode: 'payment'
});

// Helper function to get product by price ID
export const getProductByPriceId = (priceId: string) => 
  stripeProducts.find(product => product.priceId === priceId);