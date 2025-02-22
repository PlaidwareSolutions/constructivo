import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { COMPANY_NAME, COMPANY_TAGLINE, STOCK_PHOTOS } from "@/lib/constants";
import { ParallaxSection } from "@/components/shared/ParallaxSection";
import { BuildingCollage } from "./BuildingCollage";
import { motion } from "framer-motion";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      ref={containerRef}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${STOCK_PHOTOS.modern[0]})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      <ParallaxSection className="container relative mx-auto px-4 py-16">
        <motion.div
          className="max-w-2xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {COMPANY_NAME}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {COMPANY_TAGLINE}
          </p>
          <p className="text-lg text-white/80 mb-12">
            We transform spaces with innovative design and superior
            craftsmanship, creating exceptional residential and commercial
            buildings that stand the test of time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-lg"
              >
                View Our Projects
              </Button>
            </Link>
            <Link to="/services">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-lg"
              >
                Our Services
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <BuildingCollage />
        </div>
      </ParallaxSection>
    </div>
  );
}
