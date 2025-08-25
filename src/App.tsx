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

// Main Website Component
const PublicWebsite: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedTenants />
      <Events />
      <FoodDining />
      <Facilities />
      <VisitorInfo />
      <About />
      <Footer />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/*" element={<PublicWebsite />} />
      </Routes>
    </Router>
  );
}

export default App;