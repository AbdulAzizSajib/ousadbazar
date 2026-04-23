'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export type CarouselSlide = {
  id: number | string;
  image: string;
  alt?: string;
  href?: string;
};

const defaultSlides: CarouselSlide[] = [
  { id: 4, image: '/carousel/Banner-123.png', alt: 'Banner 4' },
  { id: 5, image: '/carousel/Banner-5.webp', alt: 'Banner 5' },
  { id: 6, image: '/carousel/Banner-6.webp', alt: 'Banner 6' },
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
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 ">
      {/* LEFT: Carousel */}
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const img = (
              <img
                src={slide.image}
                alt={slide.alt || `Slide ${slide.id}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="block w-full h-full object-cover object-center"
              />
            );
            return (
              <div
                key={slide.id}
                className="min-w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[32/9] lg:aspect-[32/8] xl:aspect-[32/7]"
              >
                {slide.href ? <Link href={slide.href} className="block w-full h-full">{img}</Link> : img}
              </div>
            );
          })}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
