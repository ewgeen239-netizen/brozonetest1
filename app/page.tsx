import { SiteNav } from "@/components/site/nav";
import { BooksyWidget } from "@/components/site/booksy-widget";
import { Hero } from "@/components/site/hero";
import { BookingBlock } from "@/components/site/booking";
import { GallerySection } from "@/components/site/gallery";
import {
  BarbersSection,
  ContactSection,
  ReviewsSection,
  ServicesSection,
  SiteFooter,
} from "@/components/site/sections";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <BookingBlock />
        <ServicesSection />
        <BarbersSection />
        <GallerySection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <BooksyWidget />
    </>
  );
}
