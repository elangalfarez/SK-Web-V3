// src/components/About.tsx
// Fixed: Replaced all hardcoded colors with theme-aware CSS variables and semantic tokens

const About = () => {
  return (
    <section className="py-12 md:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img 
              src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Facade%20SK/front_facade_sk_11-2025.jpeg"
              alt="Supermal Karawaci Exterior"
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-24 h-24 md:w-32 md:h-32 bg-accent rounded-2xl opacity-20"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-4 md:space-y-6 mt-8 lg:mt-0">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="heading-primary">About</span> <span className="heading-accent">Supermal Karawaci</span>
            </h2>
            <p className="text-base md:text-lg body-text leading-relaxed">
              Located in the heart of Tangerang, Supermal Karawaci is a lifestyle and shopping destination featuring hundreds of premium tenants, family-friendly experiences, and iconic events. We bring together the best of Indonesian hospitality with world-class shopping and dining experiences.
            </p>
            <p className="text-base md:text-lg body-text leading-relaxed">
              From luxury fashion boutiques to authentic local cuisine, our mall offers something special for every visitor. Join us in creating memorable moments with your loved ones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;