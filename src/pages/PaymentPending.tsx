import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Mail, ArrowLeft } from 'lucide-react';

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-12 dark:border-yellow-800 dark:bg-yellow-900/20">
        <Clock className="mx-auto mb-6 h-20 w-20 text-yellow-600 dark:text-yellow-400" />
        
        <h1 className="mb-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Pago Pendiente
        </h1>
        
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Tu pago está siendo procesado. Recibirás una confirmación por email 
          una vez que se complete el proceso.
        </p>

        {paymentId && (
          <div className="mb-6 rounded-lg bg-white p-4 text-left dark:bg-slate-800">
            <h3 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
              Detalles del pago
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p><strong>ID de pago:</strong> {paymentId}</p>
              <p><strong>Estado:</strong> Pendiente</p>
              {externalReference && (
                <p><strong>Referencia:</strong> {externalReference}</p>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-300">
            <Mail className="h-5 w-5" />
            <span className="text-sm font-medium">
              Te enviaremos un email con la confirmación
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}