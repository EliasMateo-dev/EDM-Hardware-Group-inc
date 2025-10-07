import React, { useState } from 'react';
import { X, CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useTiendaCarrito } from '../stores/tiendaCarrito';
import { useTiendaAuth } from '../stores/tiendaAuth';
import { supabase } from '../utils/supabase';
import { createDynamicProduct } from '../stripe-config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function PaymentModal({ isOpen, onClose, totalAmount }: PaymentModalProps) {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const elementos = useTiendaCarrito((state) => state.elementos);
  const vaciarCarrito = useTiendaCarrito((state) => state.vaciarCarrito);
  const { usuario, sesion } = useTiendaAuth();

  const formatearPrecio = (precio: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!customerData.name.trim()) {
      setErrorMessage('El nombre es obligatorio');
      return false;
    }
    if (!customerData.email.trim() || !customerData.email.includes('@')) {
      setErrorMessage('El email es obligatorio y debe ser válido');
      return false;
    }
    if (!customerData.address.trim()) {
      setErrorMessage('La dirección es obligatoria');
      return false;
    }
    return true;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar autenticación
    if (!usuario || !sesion) {
      setErrorMessage('Debes iniciar sesión para realizar una compra');
      setPaymentStatus('error');
      return;
    }
    
    if (!validateForm()) {
      setPaymentStatus('error');
      return;
    }

    if (elementos.length === 0) {
      setErrorMessage('No hay productos en el carrito');
      setPaymentStatus('error');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Crear producto dinámico basado en el carrito
      const dynamicProduct = createDynamicProduct(elementos, totalAmount);
      
      // Crear line items para Stripe
      const lineItems = elementos.map(elemento => ({
        price_data: {
          currency: 'ars',
          product_data: {
            name: elemento.producto.nombre,
            description: `${elemento.producto.marca} ${elemento.producto.modelo}`,
            images: elemento.producto.imagen ? [elemento.producto.imagen] : [],
          },
          unit_amount: Math.round(elemento.producto.precio * 100), // Convertir a centavos
        },
        quantity: elemento.cantidad,
      }));

      // Crear sesión de checkout usando Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sesion.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items: lineItems,
          customer_data: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
          },
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/carrito`,
          mode: 'payment',
          metadata: {
            user_id: usuario.id,
            order_data: JSON.stringify({
              items: elementos.map(el => ({
                product_id: el.producto.id,
                name: el.producto.nombre,
                quantity: el.cantidad,
                price: el.producto.precio
              })),
              customer_data: customerData,
              total_amount: totalAmount
            })
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Supabase function error:', errorData);
        throw new Error(errorData.error || 'Error al crear la sesión de pago');
      }

      const data = await response.json();

      if (data && data.url) {
        setPaymentStatus('success');
        
        // Redirigir a Stripe Checkout
        setTimeout(() => {
          window.location.href = data.url;
        }, 1500);
      } else {
        throw new Error('No se pudo crear la sesión de pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Error al procesar el pago. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-llenar datos del usuario si está autenticado
  React.useEffect(() => {
    if (usuario && !customerData.email) {
      setCustomerData(prev => ({
        ...prev,
        email: usuario.email || '',
        name: usuario.user_metadata?.full_name || usuario.user_metadata?.name || ''
      }));
    }
  }, [usuario, customerData.email]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Finalizar Compra
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!usuario ? (
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Inicia sesión requerido
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Debes iniciar sesión para realizar una compra
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        ) : paymentStatus === 'success' ? (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              ¡Redirigiendo a Stripe!
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Serás redirigido a Stripe para completar el pago de forma segura...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <h3 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
                Resumen del pedido
              </h3>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {elementos.slice(0, 3).map(elemento => (
                  <div key={elemento.producto.id} className="flex justify-between">
                    <span>{elemento.producto.nombre} x{elemento.cantidad}</span>
                    <span>{formatearPrecio(elemento.producto.precio * elemento.cantidad)}</span>
                  </div>
                ))}
                {elementos.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{elementos.length - 3} productos más...
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{formatearPrecio(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  value={customerData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            {paymentStatus === 'error' && errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar con Stripe {formatearPrecio(totalAmount)}
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Serás redirigido a Stripe para completar el pago de forma segura. 
              Aceptamos tarjetas de crédito y débito.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}