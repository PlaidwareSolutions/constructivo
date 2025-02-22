import { Helmet } from 'react-helmet-async';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { Projects } from '@/components/home/Projects';
import { Testimonials } from '@/components/home/Testimonials';
import { ContactForm } from '@/components/home/ContactForm';
import { META_DEFAULTS } from '@/lib/constants';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>{META_DEFAULTS.title}</title>
        <meta name="description" content={META_DEFAULTS.description} />
        <meta name="keywords" content={META_DEFAULTS.keywords} />
      </Helmet>

      <Hero />
      <Services />
      <Projects />
      <Testimonials />
      <ContactForm />
    </>
  );
}