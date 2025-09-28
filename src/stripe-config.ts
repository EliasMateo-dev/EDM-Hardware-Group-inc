// Stripe product configuration
export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1234567890', // Replace with your actual Stripe price ID
    name: 'test',
    description: 'test',
    mode: 'payment'
  }
];

// Helper function to get product by price ID
export const getProductByPriceId = (priceId: string) => 
  stripeProducts.find(product => product.priceId === priceId);