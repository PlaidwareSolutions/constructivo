import { Link } from "react-router-dom";
import { COMPANY_NAME, COMPANY_TAGLINE, NAVIGATION } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-secondary/5 border-t" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <section className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold">
              {COMPANY_NAME}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {COMPANY_TAGLINE}
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              We specialize in residential and commercial construction, offering
              innovative solutions and exceptional quality in every project we undertake.
            </p>
          </section>

          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {NAVIGATION.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                    aria-label={item.name}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section>
            <h3 className="text-sm font-semibold mb-4">Contact</h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:+1234567890"
                    className="text-sm text-muted-foreground hover:text-primary"
                    aria-label="Phone number"
                  >
                    (123) 456-7890
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@constructivo.com"
                    className="text-sm text-muted-foreground hover:text-primary"
                    aria-label="Email address"
                  >
                    info@constructivo.com
                  </a>
                </li>
                <li className="text-sm text-muted-foreground">
                  123 Construction Ave,<br />
                  Building City, BC 12345
                </li>
              </ul>
            </address>
          </section>
        </div>

        <section className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </section>
      </div>
    </footer>
  );
}