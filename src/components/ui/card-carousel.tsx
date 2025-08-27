"use client"

import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon } from "lucide-react"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"

interface CarouselProps {
  events: {
    id: number;
    title: string;
    image: string;
    date: string;
    time: string;
    location: string;
    description: string;
    category: string;
  }[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  events,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 30px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 350px;
    height: 500px;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 250px;
    object-fit: cover;
  }
  
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  `
  return (
    <div className="w-full">
      <style>{css}</style>
      <div className="w-full">
        <Swiper
          spaceBetween={30}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
          }}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          }}
          pagination={showPagination}
          navigation={
            showNavigation
              ? {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }
              : undefined
          }
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {events.map((event, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-royal-purple/20 overflow-hidden h-full transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-royal-purple text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg shadow-royal-purple/30">
                    {event.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-chinese-black mb-3">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                  
                  <button className="w-full py-3 bg-royal-purple text-primary rounded-lg font-semibold hover:bg-dark-purple hover:shadow-lg hover:shadow-royal-purple/20 transition-all duration-300">
                    Learn More
                  </button>
                </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}