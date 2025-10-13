import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Aplicacion from './Aplicacion';
import ErrorBoundary from './components/ErrorBoundary';
import './estilos.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<div className="p-6">Cargando aplicación...</div>}>
        <BrowserRouter>
          <Aplicacion />
        </BrowserRouter>
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
