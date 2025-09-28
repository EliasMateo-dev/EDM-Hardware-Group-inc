import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
  }
});

const preference = new Preference(client);

// Create payment endpoint
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, currency, description, customer, items } = req.body;

    // Validate required fields
    if (!amount || !customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos para el pago'
      });
    }

    // Create MercadoPago preference
    const preferenceData = {
      items: items.map(item => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: currency || 'ARS'
      })),
      payer: {
        name: customer.name.split(' ')[0] || customer.name,
        surname: customer.name.split(' ').slice(1).join(' ') || '',
        email: customer.email,
        phone: customer.phone ? {
          area_code: '11',
          number: customer.phone.replace(/\D/g, '')
        } : undefined,
        address: customer.address ? {
          street_name: customer.address,
          street_number: 123,
          zip_code: '1000'
        } : undefined
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: `EDM-${Date.now()}`,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhook`,
      statement_descriptor: 'EDM Hardware'
    };

    const response = await preference.create({
      body: preferenceData
    });

    if (response.init_point) {
      res.json({
        success: true,
        payment_url: response.init_point,
        preference_id: response.id
      });
    } else {
      throw new Error('No se pudo crear la preferencia de pago');
    }

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

// Webhook endpoint for payment notifications
app.post('/api/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      console.log('Payment notification received:', paymentId);
      
      // Here you would typically:
      // 1. Verify the payment with MercadoPago API
      // 2. Update your database
      // 3. Send confirmation emails
      // 4. Update inventory
      
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: true, message: 'Event not handled' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
});

export default app;