import { Helmet } from 'react-helmet-async';
import { SERVICES, STOCK_PHOTOS, PAGE_META, META_DEFAULTS } from '@/lib/constants';
import { ParallaxSection } from '@/components/shared/ParallaxSection';
import { BeforeAfter } from '@/components/shared/BeforeAfter';
import { Icons } from '@/components/ui/icons';
import { Card, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export default function ServicesPage() {
  return (
    <PageTransition>
      <Helmet>
        <title>{PAGE_META.services.title}</title>
        <meta name="description" content={PAGE_META.services.description} />
        <meta name="keywords" content={PAGE_META.services.keywords} />

        {/* Open Graph tags */}
        <meta property="og:title" content={PAGE_META.services.title} />
        <meta property="og:description" content={PAGE_META.services.description} />
        <meta property="og:type" content={META_DEFAULTS.og.type} />
        <meta property="og:image" content={STOCK_PHOTOS.commercial[0]} />
        <meta property="og:site_name" content={META_DEFAULTS.og.siteName} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_META.services.title} />
        <meta name="twitter:description" content={PAGE_META.services.description} />
        <meta name="twitter:image" content={STOCK_PHOTOS.commercial[0]} />

        {/* Additional SEO tags */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="relative min-h-[40vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${STOCK_PHOTOS.commercial[0]})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <ParallaxSection className="container relative mx-auto px-4 py-16">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Services
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Comprehensive construction solutions tailored to your needs, delivered with
              excellence and precision.
            </p>
          </ScrollReveal>
        </ParallaxSection>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {SERVICES.map((service, index) => {
            const Icon = Icons[service.icon as keyof typeof Icons];
            return (
              <ScrollReveal key={service.id} delay={index * 0.1}>
                <Card className="overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/30">
                        <Icon className="h-8 w-8 text-primary dark:text-white" />
                      </div>
                      <h2 className="text-2xl font-semibold">{service.title}</h2>
                    </div>
                    <p className="text-muted-foreground mb-8">{service.description}</p>

                    {service.id === 'residential' && (
                      <BeforeAfter
                        beforeImage={STOCK_PHOTOS.luxury[0]}
                        afterImage={STOCK_PHOTOS.luxury[1]}
                        className="rounded-lg overflow-hidden"
                      />
                    )}
                    {service.id === 'commercial' && (
                      <BeforeAfter
                        beforeImage={STOCK_PHOTOS.commercial[0]}
                        afterImage={STOCK_PHOTOS.commercial[1]}
                        className="rounded-lg overflow-hidden"
                      />
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}