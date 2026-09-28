'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CaralIcon } from 'iconcaral2';
import { Locale } from '@/context/language-context';
import { Button } from 'caralstable';

export interface SlideFeatureItem {
  id?: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  tag?: string;
  highlights?: string[];
  icon?: string;
}

export interface FeatureSliderProps {
  slides: SlideFeatureItem[];
  version?: string;
  language?: Locale;
  nextLabel?: string;
  prevLabel?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const HAZ_IMAGES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

export function FeatureSlider({
  slides,
  version = '1.0',
  language = 'es',
  nextLabel = 'Next',
  prevLabel = 'Prev',
  autoPlay = false,
  autoPlayInterval = 6000,
  className = '',
}: FeatureSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < total) {
      setCurrentIndex(idx);
    }
  };

  useEffect(() => {
    if (!autoPlay || total <= 1 || isPaused) return;
    const interval = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, handleNext, isPaused, total]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];
  const fallbackHaz = `/haz/${HAZ_IMAGES[currentIndex % HAZ_IMAGES.length]}.png`;
  const mediaSrc = currentSlide.mediaUrl || fallbackHaz;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`text-neutral-800 ${className}`}
    >


      {/* Slide pagination indicator (e.g. 01 / 04) */}
      {total > 1 && (
        <div className="absolute top-6 right-6 text-neutral-900">
          <span className="text-neutral-800">{(currentIndex + 1).toString().padStart(2, '0')}</span> / {total.toString().padStart(2, '0')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Visual Media Box */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full aspect-square max-w-[580px] rounded-2xl bg-[#07153A] p-4 sm:p-6 flex items-center justify-center border border-white/10 shadow-inner relative group overflow-hidden">
            <img
              key={mediaSrc}
              src={mediaSrc}
              alt={currentSlide.title || version}
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackHaz;
              }}
              className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105 animate-in fade-in zoom-in-95 duration-300"
            />
          </div>
        </div>

        {/* Right Column: Feature Content & Information */}
        <div className="md:col-span-7 flex flex-col justify-between min-h-[260px]">
          <div className='flex flex-col justify-between h-full'>

            <div className='min-h-[400px]'>
              {/* Version Badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-info-main uppercase tracking-wider block">
                  V {version.replace(/^v/i, '')}
                </span>
              </div>
              {/* Feature Title */}
              <h2
                key={`title-${currentIndex}`}
                className="text-2xl font-extrabold text-neutral-900 mb-3 leading-snug animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2.5"
              >
                {currentSlide.icon && (
                  <span className="text-info-main shrink-0">
                    <CaralIcon name={(currentSlide.icon as any) || 'magic'} size={24} />
                  </span>
                )}
                <span>{currentSlide.title}</span>
              </h2>

              {/* Feature Description */}
              {currentSlide.description && (
                <div
                  key={`desc-${currentIndex}`}
                  className="text-md text-neutral-900 leading-relaxed mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
                >
                  {currentSlide.description}
                </div>
              )}
            </div>

            {/* Sub-highlights if present */}
            {currentSlide.highlights && currentSlide.highlights.length > 0 && (
              <ul className="space-y-1.5 mb-6 text-xs sm:text-sm text-info-dark">
                {currentSlide.highlights.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-info-main font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}


            {/* Slider Controls: Dots & Navigation Arrows */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => goToSlide(dotIdx)}
                    className={`h-2 rounded-full transition-all ${dotIdx === currentIndex
                      ? 'w-6 bg-info-main shadow-sm'
                      : 'w-2 bg-neutral-800'
                      }`}
                    aria-label={`Slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              {total > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePrev}
                    iconName='chevronLeft'
                    title={prevLabel}
                    variant='ghost'
                    isIconButton
                    hasBorder
                  />

                  <Button
                    onClick={handleNext}
                    variant='info'
                    title={nextLabel}
                  >
                    <span>{nextLabel}</span>
                    <CaralIcon name="chevronRigth" size={12} />
                  </Button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
