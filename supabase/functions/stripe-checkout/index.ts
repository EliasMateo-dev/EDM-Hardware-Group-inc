import '@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'EDM Hardware Group',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { 
      line_items, 
      customer_data, 
      success_url, 
      cancel_url, 
      mode = 'payment',
      metadata = {}
    } = await req.json();

    // Validar parámetros requeridos
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return corsResponse({ error: 'line_items es requerido y debe ser un array no vacío' }, 400);
    }

    if (!success_url || !cancel_url) {
      return corsResponse({ error: 'success_url y cancel_url son requeridos' }, 400);
    }

    // Obtener usuario autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header requerido' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return corsResponse({ error: 'Usuario no autenticado' }, 401);
    }

    // Buscar o crear cliente de Stripe
    let customerId: string;
    
    const { data: existingCustomer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Error al buscar cliente:', getCustomerError);
      return corsResponse({ error: 'Error al buscar información del cliente' }, 500);
    }

    if (!existingCustomer) {
      // Crear nuevo cliente en Stripe
      const newCustomer = await stripe.customers.create({
        email: customer_data?.email || user.email,
        name: customer_data?.name,
        phone: customer_data?.phone,
        address: customer_data?.address ? {
          line1: customer_data.address,
        } : undefined,
        metadata: {
          userId: user.id,
        },
      });

      // Guardar en base de datos
      const { error: createCustomerError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: newCustomer.id,
        });

      if (createCustomerError) {
        console.error('Error al guardar cliente:', createCustomerError);
        // Limpiar cliente de Stripe si falla la base de datos
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Error al limpiar cliente de Stripe:', deleteError);
        }
        return corsResponse({ error: 'Error al crear cliente' }, 500);
      }

      customerId = newCustomer.id;
      console.log(`Cliente creado: ${customerId} para usuario: ${user.id}`);
    } else {
      customerId = existingCustomer.customer_id;
      
      // Actualizar información del cliente si se proporciona
      if (customer_data) {
        try {
          await stripe.customers.update(customerId, {
            email: customer_data.email || user.email,
            name: customer_data.name,
            phone: customer_data.phone,
            address: customer_data.address ? {
              line1: customer_data.address,
            } : undefined,
          });
        } catch (updateError) {
          console.error('Error al actualizar cliente:', updateError);
          // No fallar por esto, continuar con el checkout
        }
      }
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: line_items,
      mode: mode,
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        ...metadata,
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AR'], // Solo Argentina
      },
      locale: 'es', // Español
      currency: 'ars', // Pesos argentinos
    });

    console.log(`Sesión de checkout creada: ${session.id} para cliente: ${customerId}`);

    return corsResponse({ 
      sessionId: session.id, 
      url: session.url,
      customer_id: customerId 
    });

  } catch (error: any) {
    console.error(`Error en checkout:`, error);
    return corsResponse({ 
      error: error.message || 'Error interno del servidor' 
    }, 500);
  }
});