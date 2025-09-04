// Good Layout Code
// This is the layout that I like the most for blog pages
// It has a header with Hero Slider,categories, a main content area with blog posts,
// and a sidebar with author info and featured posts, and many more
// Refactor it into many reusable UI components in my codebase

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Laptop,
  Plane,
  Trophy,
  Briefcase,
  TrendingUp,
  Flame,
  BarChart3,
  Folder,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

export default function BlogPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      id: 1,
      image: "/red-vintage-radio-speaker-device.jpg",
      categories: ["BUSINESS", "NEWS"],
      readTime: "6 Min Read",
      author: "Ethan Caldwell",
      date: "October 16, 2024",
      title: "How Tech Shapes the Future of Work in 2024",
      excerpt:
        "In today's ever-evolving world, storytelling has become a powerful tool for connection. Revision provides a unique platform for individuals to...",
    },
    {
      id: 2,
      image: "/colorful-geometric-shapes-and-digital-icons.jpg",
      categories: ["SPORT", "TRAVEL"],
      readTime: "4 Min Read",
      author: "Ethan Caldwell",
      date: "September 29, 2024",
      title: "The Future of Work: Tech and Remote Trends",
      excerpt:
        "Find out why 2024 is predicted to be a pivotal year for sports technology and its impact on the industry.",
    },
    {
      id: 3,
      image: "/business-management-concept.jpg",
      categories: ["NEWS", "TRENDS"],
      readTime: "5 Min Read",
      author: "Ethan Caldwell",
      date: "September 27, 2024",
      title: "Remote Work Trends in the Digital Age",
      excerpt: "Discover the cutting-edge tech gadgets making travel smarter and more convenient in 2024.",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const currentHeroSlide = heroSlides[currentSlide]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-[500px] overflow-hidden rounded-3xl mt-6 mb-12">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${currentHeroSlide.image})` }}
            >
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
              {/* Top Section - Categories and Read Time */}
              <div className="flex justify-between items-start ml-12">
                <div className="flex gap-2">
                  {currentHeroSlide.categories.map((category) => (
                    <Badge
                      key={category}
                      className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs font-medium backdrop-blur-sm"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">{currentHeroSlide.readTime}</span>
                </div>
              </div>

              {/* Bottom Section - Content */}
              <div className="max-w-2xl ml-12">
                <div className="mb-4">
                  <span className="text-white/90 text-sm font-medium">{currentHeroSlide.author}</span>
                  <span className="text-white/70 text-sm ml-2">on {currentHeroSlide.date}</span>
                </div>

                <h1 className="text-4xl font-bold mb-4 text-balance leading-tight">{currentHeroSlide.title}</h1>

                <p className="text-white/90 text-base leading-relaxed mb-6 max-w-xl">{currentHeroSlide.excerpt}</p>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-2 rounded-xl">
                  Discover More
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 right-8 flex gap-2 z-20">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-8">EXPLORE TRENDING TOPICS</h1>

            {/* Topic Categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-medium"
              >
                <Laptop className="w-4 h-4 mr-2" />
                Technology
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 text-sm font-medium"
              >
                <Plane className="w-4 h-4 mr-2" />
                Travel
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 text-sm font-medium"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Sport
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 text-sm font-medium"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Business
              </Badge>
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 text-sm font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Management
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 text-sm font-medium"
              >
                <Flame className="w-4 h-4 mr-2" />
                Trends
              </Badge>
            </div>

            <div className="flex justify-center gap-4">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Startups
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-medium"
              >
                <Folder className="w-4 h-4 mr-2" />
                News
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Blog Posts */}
            <div className="lg:col-span-2 space-y-8">
              {/* First Blog Post */}
              <div className="flex gap-6 pb-8 border-b border-gray-200">
                <div className="w-[45%] relative">
                  <img
                    src="/red-vintage-radio-speaker-device.jpg"
                    alt="Red vintage radio device"
                    className="w-full h-60 object-cover rounded-3xl"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                      BUSINESS
                    </Badge>
                    <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                      NEWS
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">6 Min Read</span>
                  </div>
                </div>

                <div className="w-[55%] relative h-60">
                  {/* Author info aligned to top */}
                  <div className="absolute top-0 left-0 right-0">
                    <span className="text-blue-600 text-sm font-medium">Ethan Caldwell</span>
                    <span className="text-gray-500 text-sm ml-2">on October 16, 2024</span>
                  </div>

                  {/* Title and excerpt in middle */}
                  <div className="absolute top-8 left-0 right-0 bottom-12">
                    <h2 className="text-2xl font-bold mb-3 text-pretty leading-tight text-gray-900">
                      How Tech Shapes the Future of Work in 2024
                    </h2>

                    <p className="text-gray-600 text-sm text-pretty leading-relaxed">
                      In today's ever-evolving world, storytelling has become a powerful tool for connection. Revision
                      provides a unique platform for individuals to...
                    </p>
                  </div>

                  {/* Button aligned to bottom */}
                  <div className="absolute bottom-0 left-0">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm px-6 py-2 rounded-xl">
                      Discover More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Second Blog Post */}
              <div className="flex gap-6 pb-8 border-b border-gray-200">
                <div className="w-[45%] relative">
                  <img
                    src="/colorful-geometric-shapes-and-digital-icons.jpg"
                    alt="Colorful geometric shapes and digital icons"
                    className="w-full h-60 object-cover rounded-3xl"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                      SPORT
                    </Badge>
                    <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                      TRAVEL
                    </Badge>
                  </div>
                </div>

                <div className="w-[55%] relative h-60">
                  {/* Author info aligned to top */}
                  <div className="absolute top-0 left-0 right-0">
                    <span className="text-blue-600 text-sm font-medium">Ethan Caldwell</span>
                    <span className="text-gray-500 text-sm ml-2">on September 29, 2024</span>
                  </div>

                  {/* Title and excerpt in middle */}
                  <div className="absolute top-8 left-0 right-0 bottom-12">
                    <h2 className="text-2xl font-bold mb-3 text-pretty leading-tight text-gray-900">
                      The Future of Work: Tech and Remote Trends
                    </h2>

                    <p className="text-gray-600 text-sm text-pretty leading-relaxed">
                      Find out why 2024 is predicted to be a pivotal year for sports technology and its impact on the
                      industry.
                    </p>
                  </div>

                  {/* Button aligned to bottom */}
                  <div className="absolute bottom-0 left-0">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm px-6 py-2 rounded-xl">
                      Discover More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Third Blog Post */}
              <div className="flex gap-6 pb-8">
                <div className="w-[45%] relative">
                  <div className="w-full h-60 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-400 rounded-3xl flex items-center justify-center relative overflow-hidden">
                    <div className="w-24 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl transform rotate-12 shadow-lg"></div>
                    <div className="absolute top-3 right-3 w-4 h-4 bg-pink-500 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-10 h-1.5 bg-pink-500 rounded-full"></div>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                      NEWS
                    </Badge>
                    <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                      TRENDS
                    </Badge>
                  </div>
                </div>

                <div className="w-[55%] relative h-60">
                  {/* Author info aligned to top */}
                  <div className="absolute top-0 left-0 right-0">
                    <span className="text-blue-600 text-sm font-medium">Ethan Caldwell</span>
                    <span className="text-gray-500 text-sm ml-2">on September 27, 2024</span>
                  </div>

                  {/* Title and excerpt in middle */}
                  <div className="absolute top-8 left-0 right-0 bottom-12">
                    <h2 className="text-2xl font-bold mb-3 text-pretty leading-tight text-gray-900">
                      Remote Work Trends in the Digital Age
                    </h2>

                    <p className="text-gray-600 text-sm text-pretty leading-relaxed">
                      Discover the cutting-edge tech gadgets making travel smarter and more convenient in 2024.
                    </p>
                  </div>

                  {/* Button aligned to bottom */}
                  <div className="absolute bottom-0 left-0">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm px-6 py-2 rounded-xl">
                      Discover More
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* About Section */}
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">ABOUT</h3>

                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-12 h-12 rounded-3xl">
                      <AvatarImage src="/professional-headshot.png" />
                      <AvatarFallback>EC</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">Ethan Caldwell</h4>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">REFLECTIVE BLOGGER</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Ethan Caldwell shares thoughtful insights and reflections on life, culture, and personal growth. His
                    work explores the intersections of creativity and experience, offering readers unique perspectives.
                  </p>

                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Paris, France</span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm" className="p-2 h-auto">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 h-auto">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 h-auto">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 h-auto">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Posts Section */}
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">FEATURED POSTS</h3>

                  <Card className="overflow-hidden border-0 shadow-sm rounded-3xl">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-br from-amber-700 to-orange-800 p-4 text-white relative rounded-3xl">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3 text-xs rounded-3xl">
                          MANAGEMENT
                        </Badge>

                        <div className="mb-3">
                          <span className="text-white/80 text-xs">Ethan Caldwell</span>
                          <span className="text-white/60 text-xs ml-2">on July 7, 2024</span>
                        </div>

                        <h4 className="text-sm font-bold mb-3 text-balance leading-tight">
                          AI in Business Management: Improving Efficiency and Decision Making
                        </h4>

                        <img
                          src="/business-management-concept.jpg"
                          alt="Management concept"
                          className="w-full h-20 object-cover rounded-2xl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
