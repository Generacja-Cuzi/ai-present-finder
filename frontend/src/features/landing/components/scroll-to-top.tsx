import { ArrowUpToLine } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const goToTop = () => {
  window.scroll({
    top: 0,
    left: 0,
  });
};
export function ScrollToTop() {
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    });
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {showTopButton ? (
        <Button
          onClick={goToTop}
          className="fixed bottom-4 right-4 opacity-90 shadow-md"
          size="icon"
        >
          <ArrowUpToLine className="h-4 w-4" />
        </Button>
      ) : null}
    </>
  );
}
