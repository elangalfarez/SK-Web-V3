import { useEffect, useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

// Interfaces
export interface CarouselItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 24;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

// Component definition
export const EventsCarousel = ({
  items = [],
  baseWidth = 350,
  autoplay = true,
  autoplayDelay = 4000,
  pauseOnHover = true,
  loop = true,
  round = false,
}: CarouselProps): JSX.Element => {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  // If loop is true, a clone of the first item is added to the end for seamless transition.
  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered) && items.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          // If at the last original item and looping, go to the clone.
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          // If at the last item (or clone if looping), loop back to start or stay.
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  // Handles the instant jump when the animation completes on the cloned item.
  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  if (items.length === 0) {
    return <div>No events available</div>;
  }

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={containerRef}
        className="relative overflow-hidden p-4 rounded-2xl border border-royal-purple/20 bg-primary/5"
        style={{
          width: `${baseWidth}px`,
          height: '500px',
        }}
      >
        <motion.div
          className="flex"
          drag="x"
          {...dragProps}
          style={{
            width: itemWidth,
            gap: `${GAP}px`,
            perspective: 1000,
            perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
            x,
          }}
          onDragEnd={handleDragEnd}
          animate={{ x: -(currentIndex * trackItemOffset) }}
          transition={effectiveTransition}
          onAnimationComplete={handleAnimationComplete}
        >
          {carouselItems.map((item, index) => {
            const range = [
              -(index + 1) * trackItemOffset,
              -index * trackItemOffset,
              -(index - 1) * trackItemOffset,
            ];
            const outputRange = [15, 0, -15];
            const rotateY = useTransform(x, range, outputRange, { clamp: false });
            
            return (
              <motion.div
                key={`${item.id}-${index}`}
                className="relative shrink-0 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing group hover:shadow-xl transition-all duration-300"
                style={{
                  width: itemWidth,
                  height: '460px',
                  rotateY: rotateY,
                }}
                transition={effectiveTransition}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-royal-purple text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {item.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-gold transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gold" />
                      <span className="text-sm">{item.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gold" />
                      <span className="text-sm">{item.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gold" />
                      <span className="text-sm">{item.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">{item.description}</p>
                  
                  <div className="mt-auto">
                    <button className="w-full flex items-center justify-center py-3 bg-royal-purple border border-gold text-white rounded-lg font-semibold hover:bg-dark-gray hover:shadow-lg transition-all duration-300 group">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Dots indicator */}
        <div className="flex w-full justify-center mt-6">
          <div className="flex space-x-2">
            {items.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                  currentIndex % items.length === index 
                    ? 'bg-gold' 
                    : 'bg-gray-300'
                }`}
                animate={{
                  scale: currentIndex % items.length === index ? 1.2 : 1,
                }}
                onClick={() => setCurrentIndex(index)}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};