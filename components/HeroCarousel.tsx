"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export type CarouselSlide = {
  id: number | string;
  image: string;
  alt?: string;
  href?: string;
};

const defaultSlides: CarouselSlide[] = [
  { id: 1, image: "/carousel/banner-1.png", alt: "Banner 1" },
  { id: 2, image: "/carousel/Banner-2.png", alt: "Banner 2" },
  { id: 3, image: "/carousel/Banner-3.png", alt: "Banner 3" },

];

interface HeroCarouselProps {
  slides?: CarouselSlide[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({
  slides = defaultSlides,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);

  useEffect(() => {
    if (!autoPlayInterval || total <= 1) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [next, autoPlayInterval, total]);

  return (
    <div className="relative overflow-hidden rounded-lg my-3 sm:my-4 md:my-6">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => {
          const img = (
            <img
              src={slide.image}
              alt={slide.alt || `Slide ${slide.id}`}
              className="block w-full h-[170px] sm:h-[230px] md:h-[300px] lg:h-[410px] object-cover border rounded-sm"
            />
          );
          return (
            <div key={slide.id} className="min-w-full">
              {slide.href ? <Link href={slide.href}>{img}</Link> : img}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-5 sm:w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
