"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLoading } from "./LoadingProvider";

export default function LoadingOverlay() {
  const { isLoading, setIsLoading } = useLoading();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 1. Aparece WELCOME
      tl.set(".Loading-Square-box", { display: "flex" });
      tl.from(".Loading-Square-box", { y: 50, opacity: 0, duration: 0.8 });
      tl.from(".text-welcome", { opacity: 0, duration: 0.6 }, "-=0.4");

      // 2. WELCOME -> PROGRESS
      tl.to(".text-welcome", { opacity: 0, duration: 0.4 })
        .to(".Loading-Square-box", { width: "auto", duration: 0.4 }, "<")
        .set(".text-welcome", { display: "none" })
        .set(".text-progress", { display: "block" })
        .fromTo(".text-progress", { opacity: 0 }, { opacity: 1, duration: 1 });

      // 3. PROGRESS -> POINTS
      tl.to(".text-progress", { opacity: 0, duration: 0.4 })
        .to(".Loading-Square-box", { width: "auto", duration: 0.4 }, "<")
        .set(".text-progress", { display: "none" })
        .set(".loading-point", { display: "block" })
        .fromTo(
          ".loading-point",
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, stagger: 0.15, duration: 0.3 }
        );

      // 4. Parpadeo de puntos
      tl.to(".loading-point", {
        opacity: 0,
        stagger: 0.1,
        duration: 0.25,
        repeat: 1,
        yoyo: true,
      });

      // 5. Desaparecen puntos + caja
      tl.to(".loading-point", { opacity: 0, duration: 0.3 }, "+=0.3");
      tl.to(".Loading-Square-box", { opacity: 0, y: 40, duration: 0.8 }, "-=0.2");

      // 6. Filas en stagger
      tl.fromTo(
        ".loading-Row",
        { opacity: 1, y: 0 },
        { opacity: 0, y: 80, stagger: 0.02, duration: 0.45 },
        "-=0.6"
      );

      // ⭐ NUEVO ⭐
      // setIsLoading(false) ocurre *ANTES* del fade final del overlay
      // Esto permite que tu grid ANIME mientras el overlay aún se desvanece
      tl.add(() => {
        setIsLoading(false);
      }, "-=0.25"); // 250ms antes del fade final del overlay

      // 7. Overlay fade final (ya invisible)
      tl.to(".Loading-Overlay-container", {
        opacity: 0,
        duration: 0.1,
      });

      // Duración total ~4.5-5.0s
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading, setIsLoading]);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="Loading-Overlay-container fixed inset-0 z-10000 flex items-center justify-center h-full w-full overflow-hidden pointer-events-none select-none"
    >
      {/* Square */}
      <div className="Loading-Square-Container fixed z-10 inset-0 h-[100svh] h-full w-full flex items-center justify-center">
        <div className="Loading-Square-box hidden flex flex-row items-center justify-center py-2 px-6 rounded-xl bg-zinc-500/40 backdrop-blur-sm">
          <div className="text-welcome tracking-tight font-[paradroid-mono-soft] text-md text-zinc-200">
            WELCOME
          </div>
          <div className="hidden text-progress tracking-tight font-[paradroid-mono-soft] text-md text-zinc-200">
            WEBSITE IN PROGRESS
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="hidden loading-point relative w-2 h-2 bg-zinc-200 rounded-full mx-2 my-2"
            />
          ))}
        </div>
      </div>

      {/* Grid background */}
      <div className="load-Grid grid grid-rows-20 h-full w-full z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="loading-Row relative w-full bg-zinc-900"
          />
        ))}
      </div>
    </div>
  );
}
