import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken: import.meta.env.VITE_MP_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);

export interface MPItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MPPayer {
  name: string;
  surname: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  address?: {
    street_name: string;
    street_number: number;
    zip_code: string;
  };
}

export interface CreatePreferenceData {
  items: MPItem[];
  payer: MPPayer;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  external_reference: string;
}

export const createPreference = async (data: CreatePreferenceData) => {
  try {
    const response = await preference.create({
      body: data
    });
    return response;
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    throw error;
  }
};

export { client };