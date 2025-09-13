// src/components/ui/card-carousel.tsx
import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

export interface CarouselEvent {
  id: number | string
  title: string
  image: string
  date: string
  time: string
  location: string
  description?: string
  category?: string
  slug?: string
}

interface CarouselProps {
  events: CarouselEvent[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  /** default 7 => center + 3 left + 3 right */
  minSlidesForSeamless?: number
}

/**
 * CardCarousel
 * - 0 items => null
 * - 1 item => large full-width display (no loop)
 * - 2 items => symmetrical two-card layout (no loop)
 * - 3+ items => Swiper infinite loop with duplication math and symmetric initialSlide
 */
export const CardCarousel: React.FC<CarouselProps> = ({
  events,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
  minSlidesForSeamless = 7,
}) => {
  const count = events?.length ?? 0

  // ---------- Helper card markup ----------
  const CardMarkup: React.FC<{ event: CarouselEvent; largeImage?: boolean }> = ({ event, largeImage = false }) => (
    <article className="card-surface rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={event.image || "/img/placeholder-event.jpg"}
          alt={event.title}
          className={`w-full ${largeImage ? "h-80" : "h-64"} object-cover transition-transform duration-700 group-hover:scale-110`}
        />
        <div className="absolute top-4 left-4 card-badge px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {event.category ?? "Event"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-text-primary mb-3 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 text-text-secondary">
          <div className="flex items-center">
            <span className="text-sm">{event.date}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">{event.time}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">{event.location}</span>
          </div>
        </div>

        <div className="mt-auto">
          <a
            href={event.slug ? `/event/${event.slug}` : "#"}
            className="w-full block text-center py-3 card-cta rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            aria-label={`Learn more about ${event.title}`}
          >
            Learn More
          </a>
        </div>
      </div>
    </article>
  )

  // ---------- 0 items ----------
  if (count === 0) return null

  // ---------- 1 item: large full-width ----------
  if (count === 1) {
    const e = events[0]
    return (
      <section className="w-full px-4">
        <style>{`
          .card-cta { background: var(--color-accent); color: var(--color-text-inverse); }
          .card-cta:hover { background: var(--color-accent-hover); }
          .card-badge { background: var(--color-accent); color: var(--color-text-inverse); }
          .card-surface { background: var(--color-surface-secondary); color: var(--color-text-primary); }
        `}</style>

        <div className="mx-auto max-w-4xl">
          <div className="card-surface rounded-2xl shadow-lg overflow-hidden">
            <img
              src={e.image || "/img/placeholder-event.jpg"}
              alt={e.title}
              className="w-full h-96 object-cover"
            />
            <div className="p-8">
              <h2 className="text-3xl font-bold text-text-primary mb-4">{e.title}</h2>
              <div className="space-y-3 text-text-secondary max-w-prose">
                <div>{e.date}</div>
                <div>{e.time}</div>
                <div>{e.location}</div>
                <p className="mt-4">{e.description}</p>
              </div>
              <div className="mt-8">
                <a href={e.slug ? `/event/${e.slug}` : "#"} className="card-cta inline-block px-6 py-3 rounded-md font-semibold">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ---------- 2 items: symmetrical ----------
  if (count === 2) {
    return (
      <section className="w-full px-4">
        <style>{`
          .card-cta { background: var(--color-accent); color: var(--color-text-inverse); }
          .card-cta:hover { background: var(--color-accent-hover); }
          .card-badge { background: var(--color-accent); color: var(--color-text-inverse); }
          .card-surface { background: var(--color-surface-secondary); color: var(--color-text-primary); }
        `}</style>

        <div className="mx-auto max-w-6xl">
          <div className="flex items-stretch justify-center gap-8">
            <div className="w-full max-w-xs md:max-w-sm lg:max-w-md">
              <CardMarkup event={events[0]} />
            </div>

            <div className="w-full max-w-xs md:max-w-sm lg:max-w-md">
              <CardMarkup event={events[1]} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ---------- 3+ items: Swiper infinite loop with duplication math ----------
  const slides: CarouselEvent[] = React.useMemo(() => {
    if (events.length >= minSlidesForSeamless) return events
    const result: CarouselEvent[] = []
    let i = 0
    while (result.length < minSlidesForSeamless) {
      result.push(events[i % events.length])
      i++
      if (result.length > 500) break
    }
    return result
  }, [events, minSlidesForSeamless])

  const initialSlide = Math.floor(slides.length / 2)

  const css = `
    .card-cta { background: var(--color-accent); color: var(--color-text-inverse); }
    .card-cta:hover { background: var(--color-accent-hover); }
    .card-badge { background: var(--color-accent); color: var(--color-text-inverse); }
    .card-surface { background: var(--color-surface-secondary); color: var(--color-text-primary); }

    .swiper { width: 100%; padding-left: 8vw; padding-right: 8vw; padding-bottom: 34px; box-sizing: border-box; }
    .swiper-wrapper { align-items: flex-start; }
    .swiper-slide { width: 350px !important; height: 500px; display:flex; flex-direction:column; transition: transform 700ms cubic-bezier(.22,1,.36,1), box-shadow 420ms ease; will-change: transform; }
    .swiper-slide img { display:block; width:100%; height:250px; object-fit: cover; }
    .swiper-slide-active { transform: scale(1.06); z-index: 30; box-shadow: 0 32px 60px rgba(0,0,0,0.08); }
    .swiper-slide-next, .swiper-slide-prev { transform: scale(0.988); z-index: 10; box-shadow: 0 16px 36px rgba(0,0,0,0.06); }
    .swiper-pagination-bullet { background: var(--color-text-muted); opacity: 1; }
    .swiper-pagination-bullet-active { background: var(--color-accent); }
    .swiper-button-next, .swiper-button-prev { color: var(--color-accent); }

    @media (max-width:1023px){ .swiper{ padding-left:6vw; padding-right:6vw } .swiper-slide{ width:320px !important } }
    @media (max-width:639px){ .swiper{ padding-left:4vw; padding-right:4vw } .swiper-slide{ width: calc(100% - 48px) !important; height:auto } .swiper-slide img{ height:200px } }
  `

  return (
    <section className="w-full">
      <style>{css}</style>
      <div className="w-full">
        <Swiper
          slidesPerView={"auto"}
          centeredSlides={true}
          spaceBetween={30}
          loop={true}
          initialSlide={initialSlide}
          speed={700}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          effect={"coverflow"}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 140, modifier: 3, slideShadows: false }}
          loopedSlides={slides.length}
          loopAdditionalSlides={slides.length}
          observer={true}
          observeParents={true}
          watchSlidesVisibility={true}
          watchSlidesProgress={true}
          touchRatio={1}
          resistanceRatio={0.45}
          pagination={showPagination ? { clickable: true } : false}
          navigation={showNavigation ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" } : undefined}
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {slides.map((ev, idx) => (
            <SwiperSlide key={`slide-${String(ev.id)}-${idx}`}>
              <div className="card-surface rounded-2xl shadow-lg overflow-hidden h-full transition-all duration-300 hover:scale-105 flex flex-col">
                <div className="relative">
                  <img src={ev.image || "/img/placeholder-event.jpg"} alt={ev.title} className="w-full h-64 object-cover" />
                  <div className="absolute top-4 left-4 card-badge px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {ev.category ?? "Event"}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-3 line-clamp-2">{ev.title}</h3>

                  <div className="space-y-2 mb-4 text-text-secondary">
                    <div className="flex items-center"><span className="text-sm">{ev.date}</span></div>
                    <div className="flex items-center"><span className="text-sm">{ev.time}</span></div>
                    <div className="flex items-center"><span className="text-sm">{ev.location}</span></div>
                  </div>

                  <div className="mt-auto">
                    <a href={ev.slug ? `/event/${ev.slug}` : "#"} className="w-full block text-center py-3 card-cta rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default CardCarousel
