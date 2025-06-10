import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let animationFrameId: number | null = null;
    let totalScrolled = 0;
    const scrollSpeed = 2; // Adjust scroll speed as needed
    const totalLoops = 30;
    let completedLoops = 0;
    let loopDistance = 0; // Will be calculated after layout settles

    const scroll = () => {
      if (!container) return;

      container.scrollLeft += scrollSpeed;
      
      // Check if we've scrolled past the first set of testimonials (one loop)
      if (container.scrollLeft >= loopDistance) {
        container.scrollLeft -= loopDistance; // Reset scroll position to the beginning of the second set
        completedLoops++;
      }

      // Stop animation after completing totalLoops
      if (completedLoops >= totalLoops) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        return; // Stop animation
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    // Start the animation after ensuring layout calculation is done
    const timeoutId = setTimeout(() => {
      // Recalculate loopDistance more reliably after a short delay
      if (containerRef.current) {
        loopDistance = containerRef.current.scrollWidth / 2;
      }
      // Start the animation regardless, relying on loopDistance for resetting
      animationFrameId = requestAnimationFrame(scroll);
    }, 100); // Give a little time for layout to settle

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      clearTimeout(timeoutId);
    };
  }, [testimonials]); // Rerun effect if testimonials change

  return (
    <section className={cn(
      "bg-background text-foreground",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-x-hidden">
          <div ref={containerRef} className="flex min-w-[200%] gap-8">
            {[...testimonials, ...testimonials].map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  )
} 