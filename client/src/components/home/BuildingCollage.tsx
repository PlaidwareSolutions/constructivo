import { motion } from "framer-motion";
import { STOCK_PHOTOS } from "@/lib/constants";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";

const HOUSTON_LANDMARKS = [
  {
    image: STOCK_PHOTOS.modern[0],
    name: "Modern Business District",
  },
{
    image: STOCK_PHOTOS.commercial[0],
    name: "Downtown Houston Skyline",
  },
  {
    image: STOCK_PHOTOS.modern[1],
    name: "Texas Medical Center",
  },
  {
    image: STOCK_PHOTOS.luxury[3],
    name: "Houston Business Center",
  },
];

export function BuildingCollage() {
  const [loadedImages, setLoadedImages] = useState<number[]>([]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => [...prev, index]);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {HOUSTON_LANDMARKS.map((landmark, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
          }}
          className="group"
        >
          <motion.div
            className="cursor-pointer overflow-hidden rounded-lg"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <AspectRatio ratio={1}>
              <motion.div
                className="absolute inset-0 bg-muted/20 rounded-lg"
                initial={{ opacity: 1 }}
                animate={{
                  opacity: loadedImages.includes(index) ? 0 : 1,
                }}
                transition={{ duration: 0.5 }}
              />
              <motion.img
                src={landmark.image}
                alt={landmark.name}
                onLoad={() => handleImageLoad(index)}
                className="object-cover w-full h-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                initial={{ scale: 1.1, filter: "blur(10px)" }}
                animate={{
                  scale: loadedImages.includes(index) ? 1 : 1.1,
                  filter: loadedImages.includes(index)
                    ? "blur(0px)"
                    : "blur(10px)",
                }}
                transition={{ duration: 0.7 }}
              />
            </AspectRatio>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
