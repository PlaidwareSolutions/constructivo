import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function OptimizedImage({ src, alt, className, ...props }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        isLoading && "animate-pulse",
        className
      )}
      role="img"
      aria-label={error ? "Failed to load image" : alt}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Failed to load image
        </div>
      )}
    </div>
  );
}
