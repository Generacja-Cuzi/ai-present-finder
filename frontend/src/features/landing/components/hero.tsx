import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container grid place-items-center gap-10 lg:grid-cols-2">
      <div className="space-y-6 text-center lg:text-start">
        <main className="text-5xl font-bold md:text-6xl">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] bg-clip-text text-transparent">
              AI
            </span>{" "}
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] bg-clip-text text-transparent">
              Present Finder
            </span>{" "}
          </h1>{" "}
        </main>

        <p className="text-muted-foreground mx-auto text-xl md:w-10/12 lg:mx-0">
          Znajdź idealne pomysły na prezenty dla bliskich dzięki
          spersonalizowanym rekomendacjom napędzanym przez AI.
        </p>

        <div className="space-y-4 md:space-x-4 md:space-y-0">
          <Button className="w-full md:w-1/3" asChild>
            <Link to="/start-search" href="/start-search">
              Rozpocznij
            </Link>
          </Button>
        </div>
      </div>

      <div className="z-10">
        <img src="/aipf_logo_bgless.png" alt="Hero" className="h-auto w-full" />
      </div>

      <div className="shadow"></div>
    </section>
  );
}
