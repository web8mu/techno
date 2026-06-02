'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  title: string;
  subtitle?: string;
  button_text?: string;
  button_url?: string;
  background_image_path?: string;
}

interface HeroSliderProps {
  slides: Slide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, total]);

  if (!slides || total === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden min-h-[480px] sm:min-h-[560px] flex items-center text-white"
      style={
        slide.background_image_path
          ? { backgroundImage: `url(${slide.background_image_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${slide.background_image_path ? 'bg-black/50' : 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'}`} />

      {/* Grid pattern */}
      {!slide.background_image_path && (
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl transition-all duration-500">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl drop-shadow-lg">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-200 drop-shadow">
              {slide.subtitle}
            </p>
          )}
          {slide.button_text && slide.button_url && (
            <div className="mt-8">
              <Link
                href={slide.button_url}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
              >
                {slide.button_text}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
