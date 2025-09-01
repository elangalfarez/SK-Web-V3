// src/App.tsx
// Modified: Added /vip-cards route for VIPCardsPage component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Website Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import FeaturedTenants from './components/FeaturedTenants';
import Events from './components/Events';
import FoodDining from './components/FoodDining';
import Facilities from './components/Facilities';
import VisitorInfo from './components/VisitorInfo';
import Footer from './components/Footer';

// Page Components
import MallDirectory from './components/MallDirectory';
import PromotionsPage from './components/PromotionsPage';
import ContactPage from './components/ContactPage';
import VIPCardsPage from './components/VIPCardsPage';

// Layout Component for consistent navbar/footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-accent)',
              secondary: 'var(--color-text-inverse)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-text-inverse)',
            },
          },
        }}
      />
    </div>
  );
};

// Main Website Homepage Component
const PublicWebsite: React.FC = () => {
  return (
    <>
      <Hero />
      <FeaturedTenants />
      <Events />
      <FoodDining />
      <Facilities />
      <VisitorInfo />
      <About />
    </>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route 
          path="/" 
          element={
            <Layout>
              <PublicWebsite />
            </Layout>
          } 
        />
        
        {/* Mall Directory Page */}
        <Route 
          path="/directory" 
          element={
            <Layout>
              <MallDirectory />
            </Layout>
          } 
        />

         {/* Promotions Page */}
        <Route 
          path="/promotions" 
          element={
            <Layout>
              <PromotionsPage />
            </Layout>
          } 
        />

        {/* Contact Page */}
        <Route 
          path="/contact" 
          element={
            <Layout>
              <ContactPage />
            </Layout>
          } 
        />

        {/* VIP Cards Page */}
        <Route 
          path="/vip-cards" 
          element={
            <Layout>
              <VIPCardsPage />
            </Layout>
          } 
        />
        
        {/* Fallback to homepage */}
        <Route path="*" element={<Layout><PublicWebsite /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;