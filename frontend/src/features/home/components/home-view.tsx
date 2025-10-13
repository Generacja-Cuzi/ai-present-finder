import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function HomeView() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    void navigate({ to: "/stalking" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        {/* Gift Image */}
        <div className="mb-8 w-full max-w-sm">
          <div className="aspect-square w-full overflow-hidden rounded-3xl bg-[#D4C4B3] shadow-lg">
            <img
              src="/gift-box.png"
              alt="Gift box"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-center text-4xl font-bold text-gray-900">
          Find the perfect gift
        </h1>

        {/* Description */}
        <p className="mb-8 text-center text-lg text-gray-600">
          Answer a few questions and we&apos;ll suggest personalized gifts your
          loved ones will adore.
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleGetStarted}
          className="w-full max-w-sm rounded-full bg-[#E89B3C] py-7 text-lg font-semibold text-white shadow-lg transition-all hover:bg-[#D88A2B] active:scale-95"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
