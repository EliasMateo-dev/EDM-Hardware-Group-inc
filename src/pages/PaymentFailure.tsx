import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const statusDetail = searchParams.get('status_detail');

  const getErrorMessage = (status: string | null, statusDetail: string | null) => {
    if (status === 'rejected') {
      switch (statusDetail) {
        case 'cc_rejected_insufficient_amount':
          return 'Fondos insuficientes en la tarjeta';
        case 'cc_rejected_bad_filled_security_code':
          return 'Código de seguridad incorrecto';
        case 'cc_rejected_bad_filled_date':
          return 'Fecha de vencimiento incorrecta';
        case 'cc_rejected_bad_filled_other':
          return 'Datos de la tarjeta incorrectos';
        default:
          return 'El pago fue rechazado';
      }
    }
    return 'Hubo un problema al procesar tu pago';
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-12 dark:border-red-800 dark:bg-red-900/20">
        <XCircle className="mx-auto mb-6 h-20 w-20 text-red-600 dark:text-red-400" />
        
        <h1 className="mb-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Pago No Completado
        </h1>
        
        <p className="mb-2 text-slate-600 dark:text-slate-400">
          {getErrorMessage(status, statusDetail)}
        </p>
        
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-500">
          No te preocupes, tus productos siguen en el carrito. Puedes intentar nuevamente 
          con otro método de pago.
        </p>

        {(status || statusDetail) && (
          <div className="mb-6 rounded-lg bg-white p-4 text-left dark:bg-slate-800">
            <h3 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
              Detalles del error
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {status && <p><strong>Estado:</strong> {status}</p>}
              {statusDetail && <p><strong>Detalle:</strong> {statusDetail}</p>}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/carrito"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar nuevamente
          </Link>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}