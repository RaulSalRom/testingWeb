import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';

/**
 * Aplicación principal: Corina Capital
 * Flujo de navegación libre (Sin autenticación)
 */
function App() {
  return (
    <Router>
      <Helmet defaultTitle="Corina Capital" titleTemplate="%s - Corina Capital" />
      
      {/* Utilidad para asegurar que el scroll vuelve arriba en cambios de ruta */}
      <ScrollToTop />
      
      <Routes>
        {/* Rutas Públicas Principales */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        
        {/* Manejo de Rutas Inexistentes (404) */}
        <Route path="*" element={
          <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 text-center">
            <h1 className="text-6xl font-extrabold mb-4 text-primary">404</h1>
            <p className="text-xl text-muted-foreground mb-8">Lo sentimos, la página que buscas no existe.</p>
            <a 
              href="/" 
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Volver al inicio
            </a>
          </main>
        } />
      </Routes>

      {/* Notificaciones globales del sistema */}
      <Toaster position="top-center" richColors />
    </Router>
  );
}

export default App;