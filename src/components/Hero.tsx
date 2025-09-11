// src/components/Hero.tsx
// Modified: Replaced monolithic component with slim wrapper importing HeroSection

import { HeroSection } from './hero/HeroSection';

const Hero: React.FC = () => {
  return <HeroSection />;
};

export default Hero;