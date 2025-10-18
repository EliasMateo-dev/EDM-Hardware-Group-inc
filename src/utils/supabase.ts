import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan vars de entorno, no tiramos error en la importación para que la app pueda ejecutarse localmente.
// Exportamos un cliente falso y liviano que imita la API encadenable mínima usada en la app
// y devuelve respuestas inofensivas (arrays vacíos) o un error informativo.
let supabase: any;
if (!supabaseUrl || !supabaseKey) {
  const missingMsg = 'Missing Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)';
  console.warn('[supabase] %s — exporting a noop client for local dev', missingMsg);

  const fakeResponse = { data: null, error: new Error(missingMsg) };

  const makeBuilder = () => {
    const b: any = {
      select() { return b; },
      insert() { return b; },
      update() { return b; },
      eq() { return b; },
      single() { return b; },
      order() { return b; },
      limit() { return b; },
  // hace que el builder sea thenable para que un await devuelva una respuesta predecible
      then(resolve: any) { return Promise.resolve(fakeResponse).then(resolve); },
      catch(cb: any) { return Promise.resolve(fakeResponse).catch(cb); },
    };
    return b;
  };

  supabase = {
    from: () => makeBuilder(),
    auth: {
  // stubs mínimos
      onAuthStateChange: () => ({ data: null, error: new Error(missingMsg) }),
    },
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };


export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  brand: string;
  model: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  specifications: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}