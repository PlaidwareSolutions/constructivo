import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

export function ImageCarousel({ images, title, className }: ImageCarouselProps) {
  const [mainViewRef, mainViewApi] = useEmblaCarousel({ 
    loop: true,
    skipSnaps: false
  });

  const [thumbViewRef, thumbViewApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  // Auto-scroll functionality
  useEffect(() => {
    if (!mainViewApi) return;

    let intervalId: NodeJS.Timeout;

    const startAutoPlay = () => {
      intervalId = setInterval(() => {
        mainViewApi.scrollNext();
      }, AUTO_SCROLL_INTERVAL);
    };

    const stopAutoPlay = () => {
      clearInterval(intervalId);
    };

    // Start auto-play
    startAutoPlay();

    // Stop on hover
    const mainView = mainViewRef.current;
    if (mainView) {
      mainView.addEventListener('mouseenter', stopAutoPlay);
      mainView.addEventListener('mouseleave', startAutoPlay);
    }

    return () => {
      stopAutoPlay();
      if (mainView) {
        mainView.removeEventListener('mouseenter', stopAutoPlay);
        mainView.removeEventListener('mouseleave', startAutoPlay);
      }
    };
  }, [mainViewApi, mainViewRef]);

  const scrollPrev = useCallback(() => {
    if (mainViewApi) mainViewApi.scrollPrev();
  }, [mainViewApi]);

  const scrollNext = useCallback(() => {
    if (mainViewApi) mainViewApi.scrollNext();
  }, [mainViewApi]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainViewApi || !thumbViewApi) return;
      mainViewApi.scrollTo(index);
    },
    [mainViewApi, thumbViewApi]
  );

  return (
    <div className={cn("relative group", className)}>
      {/* Main carousel */}
      <div className="overflow-hidden rounded-t-lg" ref={mainViewRef}>
        <div className="flex touch-pan-y">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative flex-[0_0_100%] min-w-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${index + 1} of ${images.length}`}
            >
              <AspectRatio ratio={16/9}>
                <OptimizedImage
                  src={image}
                  alt={`${title} view ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - Always visible on touch devices, visible on hover for others */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch:opacity-100"
        onClick={scrollPrev}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch:opacity-100"
        onClick={scrollNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div 
          className="overflow-hidden bg-muted p-2 rounded-b-lg border-t"
          ref={thumbViewRef}
        >
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                className="flex-[0_0_64px] min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:scale-105 active:scale-95"
                onClick={() => onThumbClick(index)}
                aria-label={`View image ${index + 1}`}
              >
                <AspectRatio ratio={1}>
                  <OptimizedImage
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="object-cover w-full h-full rounded-sm border-2 border-border hover:border-primary transition-colors"
                  />
                </AspectRatio>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}