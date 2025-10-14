import type { ReactNode } from "react";

interface SearchingLayoutProps {
  title: string;
  children: ReactNode;
}

export function SearchingLayout({ title, children }: SearchingLayoutProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center px-6 pb-24">
      <div className="w-full max-w-md text-center">
        <h1 className="text-foreground mb-24 text-3xl font-semibold">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
