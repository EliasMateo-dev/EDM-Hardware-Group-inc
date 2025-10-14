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
    </div>
  );
}
