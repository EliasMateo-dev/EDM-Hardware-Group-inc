import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTiendaProductos } from './stores/tiendaProductos';
import { useTiendaCarrito } from './stores/tiendaCarrito';
import { useTiendaTema } from './stores/tiendaTema';
import Disposicion from './components/Disposicion';
import Inicio from './pages/Inicio';
import Categoria from './pages/Categoria';
import Carrito from './pages/Carrito';
import ConstructorPC from './pages/ConstructorPC';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';

function Aplicacion() {
  const { cargarCategorias, cargarProductos } = useTiendaProductos();
  const { cargarCarrito } = useTiendaCarrito();
  const inicializarTema = useTiendaTema((estado) => estado.inicializarTema);

  useEffect(() => {
    inicializarTema();
    cargarCategorias();
    cargarProductos(null);
    cargarCarrito();
  }, [cargarCategorias, cargarProductos, cargarCarrito, inicializarTema]);

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
      </Route>
    </Routes>
  );
}

export default Aplicacion;
