import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTiendaAuth } from "../stores/tiendaAuth";
import NotificationDisplay from "./NotificationDisplay";
import AdminDebugPanel from "./AdminDebugPanel";
import ErrorBoundary from "./ErrorBoundary";

import { useTiendaTema } from "../stores/tiendaTema";
import Button from './Button';

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Productos" },
  { to: "/admin/categories", label: "Categorías" },
  { to: "/admin/users", label: "Usuarios" },
  { to: "/admin/logs", label: "Registros de Actividad" },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, perfil, cargando } = useTiendaAuth();
  const { tema, alternarTema } = useTiendaTema();

  useEffect(() => {
    if (!cargando) {
      if (!usuario || !perfil?.is_admin) {
        navigate("/", { replace: true });
      }
    }
  }, [usuario, perfil, cargando, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="relative w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {/* Logo real: imagen clickable que regresa a la página principal */}
            <Link to="/" className="inline-flex items-center">
              <img src="/edm-logo.jpg" alt="EDM" className="w-8 h-8 rounded object-cover" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }} />
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-800 to-pink-700 rounded flex items-center justify-center text-white font-bold" aria-hidden>
                EDM
              </div>
            </Link>
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Admin</span>
          </div>
          <button
            onClick={alternarTema}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {tema === "dark" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            )}
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    isActive ? "bg-indigo-50 dark:bg-indigo-900 font-semibold text-indigo-700 dark:text-indigo-200" : ""
                  }`
                }
                end={item.to === "/admin"}
              >
                {item.label}
              </NavLink>
              {item.to === '/admin/logs' && (
                <div className="mt-2 px-4">
                  <Button variant="secondary" href="/" className="w-full">Regresar</Button>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="px-4 py-4">
          {/* spacer */}
          <div className="h-12" />
        </div>
      </aside>
  {/* Main content */}
  <main className="flex-1 p-6 overflow-y-auto fade-in">
        <ErrorBoundary>
          <NotificationDisplay />
          {import.meta.env.MODE !== 'production' && <AdminDebugPanel />}
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              {/* Placeholder top area for page header/actions (pages provide their own H1) */}
            </div>
            <div className="space-y-6">
              <Outlet />
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AdminLayout;
