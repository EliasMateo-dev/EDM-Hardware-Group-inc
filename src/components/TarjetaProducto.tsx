import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import LeerMas from './LeerMas';
import type { Product } from '../utils/supabase';

import { useTiendaCarrito } from '../stores/tiendaCarrito';

type PropiedadesTarjetaProducto = {
  producto: Product;
  confirmOnAdd?: boolean;
};


const formatearPrecio = (precio: number | undefined) => {
  if (typeof precio !== 'number' || isNaN(precio)) return '$ 0';
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
};


export default function TarjetaProducto({ producto, confirmOnAdd = false }: PropiedadesTarjetaProducto) {
  const agregarAlCarrito = useTiendaCarrito((estado) => estado.agregarAlCarrito);
  const [agregado, setAgregado] = useState(false);
  const [faseAnimacion, setFaseAnimacion] = useState<'idle' | 'car' | 'fill' | 'done'>('idle');
  const temporizadorRef = useRef<number | null>(null);
  const temporizadorSecuenciaRef = useRef<number | null>(null);

  const puntosDestacados = producto.specifications ? Object.entries(producto.specifications).slice(0, 3) : [];

  const elementos = useTiendaCarrito((estado) => estado.elementos);

  // Validar stock y cantidad
  const cantidadEnCarrito = elementos.find((elemento) => elemento.producto.id === producto.id)?.cantidad || 0;
  const stock = typeof producto.stock === 'number' && producto.stock >= 0 ? producto.stock : 0;
  const stockDisponible = Math.max(stock - cantidadEnCarrito, 0);

  const manejarAgregarAlCarrito = () => {
    if (stockDisponible > 0) {
      agregarAlCarrito(producto.id, 1);
      if (confirmOnAdd) {
        // Inicia la secuencia: carrito cruza -> relleno verde -> texto "Agregado"
        setFaseAnimacion('car');
        setAgregado(false);
        if (temporizadorSecuenciaRef.current) {
          window.clearTimeout(temporizadorSecuenciaRef.current);
        }
        // Carrito "atropella" por ~900ms (más lento)
        temporizadorSecuenciaRef.current = window.setTimeout(() => {
          setFaseAnimacion('fill');
          // Relleno de abajo hacia arriba por ~700ms
          temporizadorSecuenciaRef.current = window.setTimeout(() => {
            setFaseAnimacion('done');
            setAgregado(true);
            // Mantener "Agregado" visible ~1200ms y luego volver a idle
            temporizadorSecuenciaRef.current = window.setTimeout(() => {
              setAgregado(false);
              setFaseAnimacion('idle');
              temporizadorSecuenciaRef.current = null;
            }, 1200);
          }, 700);
        }, 900);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (temporizadorRef.current) {
        window.clearTimeout(temporizadorRef.current);
      }
      if (temporizadorSecuenciaRef.current) {
        window.clearTimeout(temporizadorSecuenciaRef.current);
      }
    };
  }, []);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {/* Keyframes locales para el balanceo del icono de check */}
      <style>
        {`@keyframes sway { 
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(10deg) scale(1.06); }
          75% { transform: rotate(-10deg) scale(1.06); }
        }`}
      </style>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={producto.image_url || '/placeholder.png'}
          alt={producto.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.png';
          }}
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
          {producto.brand}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header>
          <h3 className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
            {producto.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            <LeerMas maxChars={140}>{producto.description}</LeerMas>
          </p>
        </header>

        {puntosDestacados.length > 0 && (
          <dl className="grid grid-cols-1 gap-2 text-xs text-slate-500 dark:text-slate-400">
            {puntosDestacados.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                <dt className="font-medium capitalize text-slate-600 dark:text-slate-300">{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Existencias: {stockDisponible}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatearPrecio(producto.price)}</p>
          </div>
          {(() => {
            const estaEnAnimacion = confirmOnAdd && (faseAnimacion === 'car' || faseAnimacion === 'fill');
            const estaDeshabilitado = stockDisponible === 0 || estaEnAnimacion || (confirmOnAdd && agregado);
            const clasesBase = 'relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700/40 dark:disabled:text-slate-500';
            const esFaseVerde = confirmOnAdd && (faseAnimacion === 'fill' || faseAnimacion === 'done' || agregado);
            const clasesTema = esFaseVerde
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' // el color visible lo da el overlay verde
              : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200';

            return (
              <button
                onClick={manejarAgregarAlCarrito}
                disabled={estaDeshabilitado}
                className={`${clasesBase} ${clasesTema}`}
                type="button"
              >
                {/* Overlay de relleno verde de abajo hacia arriba */}
                {confirmOnAdd && (
                  <span
                    className={`pointer-events-none absolute left-0 bottom-0 z-[1] w-full bg-emerald-600 transition-[height] duration-700 ease-out`}
                    style={{ height: esFaseVerde ? '100%' : '0%' }}
                  />
                )}

                {/* Contenido principal (texto e iconos) */}
                <span
                  className={`relative z-[2] inline-flex items-center gap-2 transition-opacity duration-500 ${
                    confirmOnAdd && faseAnimacion === 'car' ? 'translate-y-[2px] scale-y-90 opacity-0 translate-x-2' : ''
                  } ${esFaseVerde ? 'text-white dark:text-white' : ''}`}
                >
                  {confirmOnAdd ? (
                    agregado || faseAnimacion === 'done' ? (
                      <>
                        <Check className="h-5 w-5 motion-reduce:animate-none" style={{ animation: 'sway 1.2s ease-in-out infinite' }} strokeWidth={2.75} />
                        Agregado
                      </>
                    ) : (
                      <>
                        {/* Icono estático sólo cuando no hay animación de coche */}
                        {faseAnimacion === 'idle' && <ShoppingCart className="h-4 w-4" />}
                        {faseAnimacion === 'fill' ? 'Agregando...' : (stockDisponible === 0 ? 'Sin stock' : 'Agregar')}
                      </>
                    )
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      {stockDisponible === 0 ? 'Sin stock' : 'Agregar'}
                    </>
                  )}
                </span>

                {/* Carrito que cruza el botón de izquierda a derecha, con desvanecido al borde derecho */}
                {confirmOnAdd && (
                  <span
                    className="pointer-events-none absolute inset-y-0 inset-x-0 z-[3]"
                    style={{
                      // Máscara para desvanecer hacia el borde derecho
                      WebkitMaskImage: 'linear-gradient(to right, black 0%, black calc(100% - 16px), transparent 100%)',
                      maskImage: 'linear-gradient(to right, black 0%, black calc(100% - 16px), transparent 100%)'
                    } as React.CSSProperties}
                  >
                    <span
                      className="absolute inset-y-0 left-3 flex items-center"
                      style={{
                        transform:
                          faseAnimacion === 'car' ? 'translateX(260%) rotate(0deg)' : 'translateX(-30%) rotate(0deg)',
                        transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)'
                      }}
                    >
                      {faseAnimacion === 'car' && (
                        <ShoppingCart className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                      )}
                    </span>
                  </span>
                )}
              </button>
            );
          })()}
        </div>
      </div>
    </article>
  );
}
