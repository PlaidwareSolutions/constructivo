import { Card, CardContent } from "@/components/ui/card";
import { SERVICES } from "@/lib/constants";
import { Icons } from "@/components/ui/icons";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";

export function Services() {
  return (
    <section
      className="py-24 bg-secondary/5"
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              id="services-heading"
              className="text-3xl font-bold mb-4"
              tabIndex={-1} // Allow programmatic focus but not tab focus
            >
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From residential new constructions to commercial renovations, we
              offer comprehensive construction services tailored to your needs.
            </p>
          </div>
        </ScrollReveal>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          role="list"
          aria-label="Services list"
        >
          {SERVICES.map((service, index) => {
            const Icon = Icons[service.icon as keyof typeof Icons];
            return (
              <ScrollReveal
                key={service.id}
                delay={index * 0.1}
                className={cn(
                  "group hover:shadow-lg transition-all duration-300",
                  "hover:translate-y-[-4px]",
                )}
              >
                <Card
                  role="listitem"
                  tabIndex={0} // Make cards focusable
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <CardContent className="p-6">
                    <div
                      className="mb-4 p-3 rounded-lg bg-primary/10 w-fit dark:bg-white/20"
                      aria-hidden="true" // Icon is decorative
                    >
                      <Icon className="h-6 w-6 text-primary dark:text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
