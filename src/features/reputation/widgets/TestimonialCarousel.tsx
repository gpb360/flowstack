/**
 * Testimonial Carousel Widget
 * Embeddable rotating testimonials
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { StarRating } from './ReviewBadge';
import { useReviews } from '../hooks/useReviews';
import { cn } from '@/lib/utils';

export interface TestimonialCarouselProps {
  organizationId: string;
  sourceId?: string;
  minRating?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showRating?: boolean;
  maxItems?: number;
}

export function TestimonialCarousel({
  organizationId,
  sourceId,
  minRating = 4,
  autoPlay = true,
  autoPlayInterval = 5000,
  showRating = true,
  maxItems = 5,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: reviews } = useReviews({
    sourceId,
    rating: minRating,
    limit: maxItems,
  });

  const testimonials = reviews?.filter((r) => r.content && r.content.length > 0) || [];

  useEffect(() => {
    if (!autoPlay || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <CardUntitled className="p-8 text-center text-muted-foreground">
        No testimonials available
      </CardUntitled>
    );
  }

  const current = testimonials[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <CardUntitled className="p-8">
      <div className="relative">
        {/* Quote icon */}
        <Quote className="absolute -top-2 left-0 h-12 w-12 text-gray-200" />

        {/* Content */}
        <div className="ml-8">
          {showRating && (
            <div className="mb-4">
              <StarRating rating={current.rating} size="lg" />
            </div>
          )}

          <blockquote className="mb-4 text-lg italic text-gray-700">
            "{current.content}"
          </blockquote>

          <cite className="not-italic">
            <span className="font-medium">{current.reviewer_name || 'Anonymous'}</span>
            {current.is_verified_purchase && (
              <span className="ml-2 text-xs text-green-600">Verified</span>
            )}
          </cite>

          {current.title && (
            <p className="mt-2 text-sm text-muted-foreground">{current.title}</p>
          )}
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    index === currentIndex ? 'bg-[#D4AF37]' : 'bg-gray-300'
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <ButtonUntitled
                variant="outline"
                size="sm"
                isIconOnly
                onClick={prev}
              >
                <ChevronLeft className="h-4 w-4" />
              </ButtonUntitled>
              <ButtonUntitled
                variant="outline"
                size="sm"
                isIconOnly
                onClick={next}
              >
                <ChevronRight className="h-4 w-4" />
              </ButtonUntitled>
            </div>
          </div>
        )}

        {/* Counter */}
        {testimonials.length > 1 && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {currentIndex + 1} of {testimonials.length}
          </div>
        )}
      </div>
    </CardUntitled>
  );
}

/**
 * Generate embed code for testimonial carousel
 */
export function generateTestimonialEmbedCode(
  organizationId: string,
  options: TestimonialCarouselProps
): string {
  const params = new URLSearchParams({
    org: organizationId,
    ...(options.sourceId && { source: options.sourceId }),
    ...(options.minRating && { minRating: String(options.minRating) }),
    autoPlay: String(options.autoPlay),
    autoPlayInterval: String(options.autoPlayInterval),
    showRating: String(options.showRating),
    maxItems: String(options.maxItems),
  });

  return `<div id="testimonial-carousel"></div>
<script src="${window.location.origin}/widgets/testimonial-carousel.js?${params.toString()}"></script>`;
}
