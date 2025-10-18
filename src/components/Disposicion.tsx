// Using the automatic JSX runtime; no default React import required
import { Outlet } from 'react-router-dom';
import BarraNavegacion from './BarraNavegacion';
import DevTelemetryBanner from './DevTelemetryBanner';

export default function Disposicion() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <BarraNavegacion />
      <main>
        <Outlet />
      </main>
      <DevTelemetryBanner />
      <footer className="mt-12 border-t border-slate-200 bg-white/80 dark:bg-slate-950/75">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col items-start gap-3 text-sm text-slate-600 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} EDM Hardware</div>
          <div className="space-y-1">
            <div><strong>Elías Mateo</strong> — LÍDER DEL PROYECTO &amp; LÍDER TÉCNICO &amp; DBA &amp; DESARROLLADOR principal</div>
            <div><strong>Dylan Foster</strong> — TESTING &amp; DATA ENTRY</div>
            <div><strong>Matías Alvarez</strong> — PROGRAMADOR secundario &amp; MEJORAS LÓGICAS</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
