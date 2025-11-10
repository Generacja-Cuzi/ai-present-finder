import { FAQ } from "../components/faq";
import { Hero } from "../components/hero";
import { HowItWorks } from "../components/how-it-works";
import { ScrollToTop } from "../components/scroll-to-top";
import { Team } from "../components/team";

export function LandingView() {
  return (
    <main className="flex min-h-screen flex-col px-4 lg:px-16">
      <Hero />
      <HowItWorks />
      <Team />
      <FAQ />
      <ScrollToTop />
    </main>
  );
}
