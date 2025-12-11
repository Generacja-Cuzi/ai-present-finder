import { FAQ } from "../components/faq";
import { Hero } from "../components/hero";
import { HowItWorks } from "../components/how-it-works";
import { ScrollToTop } from "../components/scroll-to-top";
import { Team } from "../components/team";

export function LandingView() {
  return (
    <main className="mt-16 flex min-h-screen flex-col items-center px-4 lg:px-16 lg:pt-0">
      <Hero />
      <HowItWorks />
      <Team />
      <FAQ />
      <ScrollToTop />
    </main>
  );
}
