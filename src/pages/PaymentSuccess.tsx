import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useTiendaCarrito } from '../stores/tiendaCarrito';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const vaciarCarrito = useTiendaCarrito((state) => state.vaciarCarrito);
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    // Clear cart on successful payment
    if (status === 'approved') {
      vaciarCarrito();
    }
  }, [status, vaciarCarrito]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-12 dark:border-green-800 dark:bg-green-900/20">
        <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-600 dark:text-green-400" />
        
        <h1 className="mb-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          ¡Pago Exitoso!
        </h1>
        
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Tu compra ha sido procesada correctamente. Recibirás un email de confirmación 
          con los detalles de tu pedido.
        </p>

        {paymentId && (
          <div className="mb-6 rounded-lg bg-white p-4 text-left dark:bg-slate-800">
            <h3 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
              Detalles del pago
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p><strong>ID de pago:</strong> {paymentId}</p>
              <p><strong>Estado:</strong> {status === 'approved' ? 'Aprobado' : status}</p>
              {externalReference && (
                <p><strong>Referencia:</strong> {externalReference}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Package className="h-4 w-4" />
            Seguir comprando
          </Link>
          
          <Link
            to="/constructor-pc"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
          >
            Constructor PC
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}