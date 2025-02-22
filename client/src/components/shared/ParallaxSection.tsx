import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  className?: string;
  children: React.ReactNode;
  speed?: number; // Speed multiplier for parallax effect
}

export function ParallaxSection({
  className,
  children,
  speed = 0.5,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let ticking = false;
    let initialTop = element.offsetTop;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!element) return;
          const scrolled = window.scrollY;
          const distance = initialTop - scrolled;
          const translate = distance * speed;
          
          element.style.transform = `translateY(${translate}px)`;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={cn("relative will-change-transform", className)}
    >
      {children}
    </div>
  );
}
