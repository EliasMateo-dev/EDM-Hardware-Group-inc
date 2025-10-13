import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTiendaAuth } from "../stores/tiendaAuth";
import NotificationDisplay from "./NotificationDisplay";
import AdminDebugPanel from "./AdminDebugPanel";
import ErrorBoundary from "./ErrorBoundary";

import { useTiendaTema } from "../stores/tiendaTema";

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
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100">Admin Panel</span>
          <button
            onClick={alternarTema}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {tema === "dark" ? (
              // Sun icon SVG
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" />
              </svg>
            ) : (
              // Moon icon SVG
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            )}
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
                }`
              }
              end={item.to === "/admin"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-4 py-4">
          <NavLink to="/" className="block text-center px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors">Regresar</NavLink>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <ErrorBoundary>
          <NotificationDisplay />
          {import.meta.env.MODE !== 'production' && <AdminDebugPanel />}
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AdminLayout;
