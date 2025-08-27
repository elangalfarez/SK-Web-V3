// src/App.tsx (Updated)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
        
        {/* Fallback to homepage */}
        <Route path="*" element={<Layout><PublicWebsite /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;