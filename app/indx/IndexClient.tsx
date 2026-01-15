"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import IndexBackground from "../components/IndexBackground";

export default function IndexClient() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const box = containerRef.current!.querySelector(".index-box");
      const points = containerRef.current!.querySelectorAll(".index-loading-point");

      gsap.set(box, { y: 24, opacity: 0 });
      gsap.set(points, { opacity: 0.3, scale: 0.8 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro.to(box, {
        y: 0,
        opacity: 1,
        duration: 0.9,
      });

      tlRef.current = gsap
        .timeline({ repeat: -1, delay: 0.4 })
        .to(points, {
          opacity: 0.8,
          scale: 1,
          duration: 0.5,
          stagger: 0.2,
          ease: "power2.inOut",
        })
        .to(points, {
          opacity: 0.3,
          scale: 0.8,
          duration: 0.5,
          stagger: 0.2,
          ease: "power2.inOut",
        });
    }, containerRef);

    return () => {
      ctx.revert();
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <IndexBackground />

      <div
        ref={containerRef}
        className="absolute inset-0 z-10 flex items-center justify-center text-black text-center pointer-events-none"
      >
        <div className="index-box bg-zinc-100/90 border border-zinc-200 rounded-2xl p-8">
          <p className="font-mono text-sm opacity-80 mb-2">
            Selected work available in ARCHIVE
          </p>
          <p className="font-mono text-sm opacity-60">
            Full site in progress
          </p>

          <div className="flex justify-center items-center pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="index-loading-point w-1 h-1 bg-black rounded-full mx-2"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
