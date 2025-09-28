import React, { useState } from 'react';
import { X, CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useTiendaCarrito } from '../stores/tiendaCarrito';
import vexor, { type PaymentData } from '../lib/vexor';

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
  const [paymentUrl, setPaymentUrl] = useState('');

  const elementos = useTiendaCarrito((state) => state.elementos);
  const vaciarCarrito = useTiendaCarrito((state) => state.vaciarCarrito);

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
    
    if (!validateForm()) {
      setPaymentStatus('error');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Prepare payment data for Vexor
      const paymentData: PaymentData = {
        amount: totalAmount,
        currency: 'ARS',
        description: `Compra EDM Hardware - ${elementos.length} productos`,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address
        },
        items: elementos.map(elemento => ({
          id: elemento.producto.id,
          name: elemento.producto.nombre,
          quantity: elemento.cantidad,
          unit_price: elemento.producto.precio
        }))
      };

      // Create payment with Vexor
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success && result.payment_url) {
        setPaymentStatus('success');
        setPaymentUrl(result.payment_url);
        
        // Redirect to payment URL
        setTimeout(() => {
          window.open(result.payment_url, '_blank');
          vaciarCarrito();
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

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

        {paymentStatus === 'success' ? (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              ¡Pago Iniciado!
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Serás redirigido a la página de pago en unos segundos...
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
                  Pagar {formatearPrecio(totalAmount)}
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Serás redirigido a Mercado Pago para completar el pago de forma segura.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}