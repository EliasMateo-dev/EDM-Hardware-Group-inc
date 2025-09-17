import React from 'react';
import { Box, CircuitBoard, Cpu, HardDrive, MemoryStick, Monitor, Zap } from 'lucide-react';

const steps = [
  { icon: Cpu, label: 'CPU', description: 'Procesador' },
  { icon: CircuitBoard, label: 'Motherboard', description: 'Placa base' },
  { icon: MemoryStick, label: 'RAM', description: 'Memoria' },
  { icon: Monitor, label: 'GPU', description: 'Tarjeta grafica' },
  { icon: Zap, label: 'PSU', description: 'Fuente de poder' },
  { icon: Box, label: 'Gabinete', description: 'Case' },
  { icon: HardDrive, label: 'SSD', description: 'Almacenamiento' },
];

export default function PCBuilder() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Construye tu PC</p>
        <h1 className="text-4xl font-semibold text-slate-900">PC Builder </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-500">
          Estamos preparando nuestro PC Builder para CPU, memoria, gabinetes y mucho mas. Mientras tanto podés armar un carrito con el catalogo base!
        </p>
      </header>

      <div className="mb-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Lo que estoy en proceso</h2>
        <ul className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">Compatibilidad de socket y chipset al instante.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">Validacion de memoria DDR4 o DDR5 y cantidad maxima.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">Calculo automático de potencia recomendada para la PSU.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">Verificacion de espacio para placas de video y cooling.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">Alertas de cuellos de botella segun CPU y GPU elegidos.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">Sugerencias de upgrades rapidos segun tu presupuesto.</li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <article
            key={step.label}
            className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          >
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-slate-900">{step.label}</h3>
            <p className="text-xs text-slate-500">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}