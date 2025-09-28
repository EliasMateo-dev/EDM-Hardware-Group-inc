import { Vexor } from 'vexor';

// Initialize Vexor with environment variables
const vexor = new Vexor({
  projectId: import.meta.env.VITE_VEXOR_PROJECT || '68d963e746966dfc8137ef2',
  publishableKey: import.meta.env.VITE_VEXOR_PUBLISHABLE_KEY || 'vx_prod_pk_9c816755a2a94c1fbe08ec36bf434c8f_67530281_2a49_445d_b9ae_4b185605cff2_2ea97d',
});

export default vexor;

// Types for payment processing
export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface PaymentResponse {
  id: string;
  status: string;
  payment_url?: string;
  error?: string;
}