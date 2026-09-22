'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react';
import { GalleryItem, AchievementItem } from '@/types';
import { normalizeImageUrl } from '@/lib/image-utils';

interface GallerySlideshowProps {
  galleries: GalleryItem[];
  achievements?: AchievementItem[];
  onOpenView: (viewName: string, data?: any) => void;
}

export function GallerySlideshow({ galleries, achievements = [], onOpenView }: GallerySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter ONLY published items and extract/normalize their URLs
  const galleryImages = galleries
    .filter(g => g.status === 'published' && g.imageUrl)
    .map(g => ({
      url: normalizeImageUrl(g.imageUrl),
      title: g.title,
      type: 'Galeri Sekolah'
    }));

  const achievementImages = achievements
    .filter(a => a.imageUrl)
    .map(a => ({
      url: normalizeImageUrl(a.imageUrl),
      title: a.title,
      type: 'Prestasi Sekolah'
    }));

  const slides = [...galleryImages, ...achievementImages];

  // Auto-slide logic
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null; // Don't render if no images

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full relative group bg-slate-100 border-b border-slate-200">
      
      {/* Aspect Ratio Container (Widescreen for Banner) */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] max-h-[500px] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onOpenView('gallery')}>
        
        {/* Slides */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* The Image (Un-darkened, Pure Image) */}
            <div 
              className="absolute inset-0 bg-contain md:bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${slide.url})` }}
            />
            {/* Gradient Overlay just for caption legibility */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent pointer-events-none" />
            
            {/* Caption */}
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-12 right-4 sm:right-12 z-20 pointer-events-none">
              <span className="inline-block px-3 py-1 mb-2 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                {slide.type}
              </span>
              <h3 className="text-white font-bold text-lg sm:text-2xl md:text-3xl drop-shadow-md line-clamp-2 max-w-4xl">
                {slide.title || 'Dokumentasi Sekolah'}
              </h3>
            </div>
          </div>
        ))}

        {/* Controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900/50 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900/50 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </>
        )}

        {/* Zoom/Expand Hint Button */}
        <button
          className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-slate-900/60 hover:bg-emerald-600 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all opacity-0 group-hover:opacity-100"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Lihat Penuh</span>
        </button>

        {/* Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-12 z-30 flex gap-2 pointer-events-none">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full h-1.5 sm:h-2 ${
                  idx === currentIndex ? 'w-6 sm:w-8 bg-emerald-400' : 'w-1.5 sm:w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
