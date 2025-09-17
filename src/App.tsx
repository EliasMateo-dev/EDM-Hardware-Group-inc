import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useProductsStore } from './stores/productsStore';
import { useCartStore } from './stores/cartStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Cart from './pages/Cart';
import PCBuilder from './pages/PCBuilder';

function App() {
  const { fetchCategories, fetchProducts } = useProductsStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts(null);
    fetchCart();
  }, [fetchCategories, fetchProducts, fetchCart]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="category/:slug" element={<Category />} />
        <Route path="cart" element={<Cart />} />
        <Route path="pc-builder" element={<PCBuilder />} />
      </Route>
    </Routes>
  );
}

export default App;