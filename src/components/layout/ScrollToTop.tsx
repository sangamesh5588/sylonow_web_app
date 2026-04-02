import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type LenisLike = {
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
};

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
};
