import '@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'EDM Hardware Group',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Obtener la firma del header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // Obtener el body raw
    const body = await req.text();

    // Verificar la firma del webhook
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    console.log(`Webhook recibido: ${event.type}`);

    // Procesar el evento en background
    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Procesando checkout session completada: ${session.id}`);
  
  const { customer, payment_intent, mode, payment_status } = session;
  
  if (!customer || typeof customer !== 'string') {
    console.error('No customer ID found in session');
    return;
  }

  if (mode === 'payment' && payment_status === 'paid') {
    // Manejar pago único
    try {
      const { error: orderError } = await supabase
        .from('stripe_orders')
        .insert({
          checkout_session_id: session.id,
          payment_intent_id: payment_intent as string,
          customer_id: customer,
          amount_subtotal: session.amount_subtotal || 0,
          amount_total: session.amount_total || 0,
          currency: session.currency || 'ars',
          payment_status: payment_status,
          status: 'completed',
        });

      if (orderError) {
        console.error('Error insertando orden:', orderError);
        return;
      }

      console.log(`Orden creada exitosamente para session: ${session.id}`);
      
      // Aquí podrías agregar lógica adicional como:
      // - Enviar email de confirmación
      // - Actualizar inventario
      // - Crear registro de envío
      
    } catch (error) {
      console.error('Error procesando pago único:', error);
    }
  } else if (mode === 'subscription') {
    // Manejar suscripción
    await syncCustomerFromStripe(customer);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);
  
  // Solo procesar si no es parte de una factura (pago único)
  if (paymentIntent.invoice === null) {
    // Actualizar estado del pago si es necesario
    const { error } = await supabase
      .from('stripe_orders')
      .update({ 
        payment_status: 'paid',
        status: 'completed' 
      })
      .eq('payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error actualizando estado de pago:', error);
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log(`Procesando cambio de suscripción: ${subscription.id}`);
  
  const customerId = subscription.customer as string;
  await syncCustomerFromStripe(customerId);
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    console.log(`Sincronizando cliente desde Stripe: ${customerId}`);
    
    // Obtener suscripciones del cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.log(`No hay suscripciones para el cliente: ${customerId}`);
      
      const { error } = await supabase
        .from('stripe_subscriptions')
        .upsert({
          customer_id: customerId,
          status: 'not_started',
        }, {
          onConflict: 'customer_id',
        });

      if (error) {
        console.error('Error actualizando estado de suscripción:', error);
      }
      return;
    }

    // Asumir que un cliente solo puede tener una suscripción
    const subscription = subscriptions.data[0];

    // Actualizar estado de suscripción
    const updateData: any = {
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price?.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
    };

    // Agregar información del método de pago si está disponible
    if (subscription.default_payment_method && 
        typeof subscription.default_payment_method !== 'string') {
      const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;
      updateData.payment_method_brand = paymentMethod.card?.brand || null;
      updateData.payment_method_last4 = paymentMethod.card?.last4 || null;
    }

    const { error } = await supabase
      .from('stripe_subscriptions')
      .upsert(updateData, {
        onConflict: 'customer_id',
      });

    if (error) {
      console.error('Error sincronizando suscripción:', error);
      throw error;
    }

    console.log(`Suscripción sincronizada exitosamente para cliente: ${customerId}`);
  } catch (error) {
    console.error(`Error sincronizando cliente ${customerId}:`, error);
    throw error;
  }
}