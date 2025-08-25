import React from 'react';
import { Utensils, Star } from 'lucide-react';

const FoodDining = () => {
  const restaurants = [
    {
      name: "Sate Khas Senayan",
      category: "Indonesian Traditional",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/SKS.png?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      priceRange: "$$"
    },
    {
      name: "Yoshinoya",
      category: "Japanese Quick Serve",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/YOSHINOYA.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 4.6,
      priceRange: "$$"
    },
    {
      name: "Pizza Hut",
      category: "Italian Family Dining",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/PIZZA-H-scaled.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 4.5,
      priceRange: "$$"
    },
    {
      name: "Burger King",
      category: "American Fast Food",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/BURGER-KING.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 4.3,
      priceRange: "$$"
    },
    {
      name: "Bakmi GM",
      category: "Indonesian Noodles",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/BAKMI-GM.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 4.7,
      priceRange: "$"
    },
    {
      name: "Chatime",
      category: "Bubble Tea & Beverages",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/CHATIME-1-scaled.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 4.4,
      priceRange: "$"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-onyx-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Culinary <span className="text-gold">Experiences</span>
          </h2>
          <p className="text-lg md:text-xl text-white-600 max-w-2xl mx-auto">
            From street snacks to fine dining - savor the best flavors all in one place
          </p>
        </div>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="relative">
                <img 
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-40 md:h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">{restaurant.rating}</span>
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-primary">{restaurant.name}</h3>
                  <span className="text-green-600 font-semibold">{restaurant.priceRange}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Utensils className="w-4 h-4 mr-2 text-gold" />
                  <span className="text-sm">{restaurant.category}</span>
                </div>
                
                <button className="w-full py-3 bg-primary border border-primary text-white rounded-lg font-semibold hover:bg-royal-purple hover:shadow-lg transition-all duration-300">
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-6 md:px-8 py-3 md:py-4 bg-primary text-white font-semibold rounded-full hover:bg-royal-purple hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg text-sm md:text-base">
            Explore All Restaurants
          </button>
        </div>
      </div>
    </section>
  );
};

export default FoodDining;