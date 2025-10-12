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
// Admin imports
import AdminLayout from './components/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryForm from './pages/admin/AdminCategoryForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserForm from './pages/admin/AdminUserForm';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';

function Aplicacion() {
  const { cargarCategorias, cargarProductos } = useTiendaProductos();
  const { cargarCarrito } = useTiendaCarrito();
  const inicializarTema = useTiendaTema((estado) => estado.inicializarTema);
  const inicializarAuth = useTiendaAuth((estado) => estado.inicializarAuth);

  useEffect(() => {
    (async () => {
      try {
        inicializarTema();
        await inicializarAuth();
        await cargarCategorias();
        await cargarProductos(null);
        await cargarCarrito();
      } catch (err) {
        console.error('Error during app initialization', err);
      }
    })();
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
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/new" element={<AdminCategoryForm />} />
        <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/new" element={<AdminUserForm />} />
        <Route path="users/edit/:id" element={<AdminUserForm />} />
        <Route path="logs" element={<AdminActivityLogs />} />
      </Route>
    </Routes>
  );
}

export default Aplicacion;
