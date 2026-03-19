
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';

function App() {
  return (
    <Router>
      <Helmet defaultTitle="Corina Capital" titleTemplate="%s - Corina Capital" />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-muted-foreground mb-8">Página no encontrada</p>
            <a href="/" className="text-primary hover:underline">Volver al inicio</a>
          </div>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
