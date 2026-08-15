import { Caveat } from 'next/font/google';

import FullHeroSection from '@/components/about/FullHeroSection';
import JourneyRouteSection from '@/components/about/JourneyRouteSection';
import CreativeCtaSection from '@/components/about/CreativeCtaSection';

const caveat = Caveat({
   subsets: ['latin'],
   weight: ['400', '700'],
   display: 'swap',
});

export const metadata = {
   title: 'About Us | Tomato Food Delivery',
   description:
      'Learn about Tomato - connecting hungry hearts with top local kitchens, craft culinary experiences, and fast, reliable delivery.',
};

export default function AboutPage() {
   return (
      <main className="min-h-screen bg-white text-[#02060C] font-sans">
         {/* Section 1: Full-Length Hero Image, Name, Quote, Description */}
         <FullHeroSection creativeFontClass={caveat.className} />

         {/* Section 2: Pin Route Journey Timeline */}
         <JourneyRouteSection creativeFontClass={caveat.className} />

         {/* Section 3: Creative Finale CTA */}
         <CreativeCtaSection creativeFontClass={caveat.className} />
      </main>
   );
}
