import { ShareTestimonialDialog } from "@/components/testimonials/ShareTestimonialDialog";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

const testimonialVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export function Testimonials() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Configure Embla carousel with smooth sliding
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: false,
    watchDrag: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Auto-scrolling functionality
  useEffect(() => {
    if (emblaApi) {
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);

      return () => {
        clearInterval(autoplay);
      };
    }
  }, [emblaApi]);

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials/approved"],
  });

  return (
    <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4" ref={containerRef}>
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            What Our Clients Say
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Read testimonials from our satisfied clients about their experiences
            working with us.
          </motion.p>
        </div>

        {testimonials.length > 0 ? (
          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -mx-4 transition-transform duration-300 ease-out">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="flex-[0_0_100%] sm:flex-[0_0_50%] px-4 sm:px-6" // Responsive padding - 1 card on mobile, 2 on desktop
                  >
                    <motion.div
                      custom={index}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      variants={testimonialVariants}
                      className="h-full transform transition-all duration-300"
                    >
                      <Card className="h-full bg-card hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ease-out">
                        <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                          <div className="mb-6">
                            <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-primary/40" />
                          </div>
                          <blockquote className="flex-grow">
                            <p className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed italic text-foreground/90">
                              "{testimonial.content}"
                            </p>
                            <footer className="mt-auto pt-4 border-t border-border/40">
                              <cite className="not-italic">
                                <div className="font-semibold text-foreground">
                                  {testimonial.name}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {testimonial.role}
                                </div>
                              </cite>
                            </footer>
                          </blockquote>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-2 sm:px-4">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg transform hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg transform hover:scale-110 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">
              No testimonials yet. Be the first to share your experience!
            </p>
          </div>
        )}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
          }
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ShareTestimonialDialog />
        </motion.div>
      </div>
    </section>
  );
}
