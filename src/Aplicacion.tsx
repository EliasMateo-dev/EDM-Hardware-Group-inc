import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SupabaseTest from './components/SupabaseTest';
import { useTiendaProductos } from './stores/tiendaProductos';
import { useTiendaCarrito } from './stores/tiendaCarrito';
import { useTiendaTema } from './stores/tiendaTema';
import { useTiendaAuth } from './stores/tiendaAuth';

import Disposicion from './components/Disposicion';
import Inicio from './pages/Inicio';
import Categoria from './pages/Categoria';
import Carrito from './pages/Carrito';
import ConstructorPC from './pages/ConstructorPC';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import AdminLayout from './components/AdminLayout';
// Placeholders para páginas admin
const AdminDashboard = () => <div>Dashboard Admin</div>;
const AdminProducts = () => <div>Admin Productos</div>;
const AdminProductForm = () => <div>Admin Formulario Producto</div>;
const AdminCategories = () => <div>Admin Categorías</div>;
const AdminCategoryForm = () => <div>Admin Formulario Categoría</div>;
const AdminUsers = () => <div>Admin Usuarios</div>;
const AdminActivityLogs = () => <div>Admin Registros de Actividad</div>;

function Aplicacion() {
  const { cargarCategorias, cargarProductos } = useTiendaProductos();
  const { cargarCarrito } = useTiendaCarrito();
  const inicializarTema = useTiendaTema((estado) => estado.inicializarTema);
  const inicializarAuth = useTiendaAuth((estado) => estado.inicializarAuth);

  useEffect(() => {
    inicializarTema();
    inicializarAuth();
    cargarCategorias();
    cargarProductos(null);
    cargarCarrito();
  }, [cargarCategorias, cargarProductos, cargarCarrito, inicializarTema, inicializarAuth]);

  return (
    <Routes>
      <Route path="/" element={<Disposicion />}>
        <Route index element={<Inicio />} />
        <Route path="categoria/:alias" element={<Categoria />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="constructor-pc" element={<ConstructorPC />} />
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/failure" element={<PaymentFailure />} />
        <Route path="payment/pending" element={<PaymentPending />} />
        <Route path="supabase-test" element={<SupabaseTest />} />
      </Route>
      {/* Rutas protegidas de admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/new" element={<AdminCategoryForm />} />
        <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="logs" element={<AdminActivityLogs />} />
      </Route>
    </Routes>
  );
}

export default Aplicacion;
