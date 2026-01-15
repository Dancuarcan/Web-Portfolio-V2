"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function ClientLenis() {
  useEffect(() => {
    // inicializa una sola instancia global de Lenis
    const lenis = new Lenis({
      smoothWheel: true,
      smoothTouch: true,
      lerp: 0.16,
      wheelMultiplier: 0.7,
      touchMultiplier: 0.8,
    });

    // exponer para que otras páginas puedan refresh/resize
    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return null; // no renderiza nada visible
}
