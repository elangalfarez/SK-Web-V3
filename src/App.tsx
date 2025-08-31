// src/App.tsx
// Modified: Added /contact route for ContactPage component and React Hot Toast Toaster
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

// Mall Directory Component
import MallDirectory from './components/MallDirectory';

// Promotions component
import PromotionsPage from './components/PromotionsPage';

// Contact component
import ContactPage from './components/ContactPage';

// Layout Component for consistent navbar/footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
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
        
        {/* Fallback to homepage */}
        <Route path="*" element={<Layout><PublicWebsite /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;