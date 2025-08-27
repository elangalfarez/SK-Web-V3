import React from 'react';
import { ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <section className="py-12 md:py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img 
              src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/08/WhatsApp-Image-2025-07-27-at-16.38.41_7d7c30a9.jpg?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Supermal Karawaci Exterior"
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-24 h-24 md:w-32 md:h-32 bg-gold rounded-2xl opacity-20"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-4 md:space-y-6 mt-8 lg:mt-0">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              <span className="text-black">About</span> <span className="text-gold">Supermal Karawaci</span>
            </h2>
            <p className="text-base md:text-lg text-white-600 leading-relaxed">
              Located in the heart of Tangerang, Supermal Karawaci is a lifestyle and shopping destination featuring hundreds of premium tenants, family-friendly experiences, and iconic events. We bring together the best of Indonesian hospitality with world-class shopping and dining experiences.
            </p>
            <p className="text-base md:text-lg text-white-600 leading-relaxed">
              From luxury fashion boutiques to authentic local cuisine, our mall offers something special for every visitor. Join us in creating memorable moments with your loved ones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;