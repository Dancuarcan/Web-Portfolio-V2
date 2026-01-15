"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function IndexBackground() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hasShownRef = useRef(false); // evita re-animar

  useEffect(() => {
    if (!wrapperRef.current) return;

    const el = wrapperRef.current;

    // ⬇️ estado inicial del fondo
    gsap.set(el, { opacity: 0 });

    // quickSetter = MUCHO mejor performance
    const setFilter = gsap.quickSetter(el, "filter");

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const cyi = window.innerWidth / 1;

    const maxDist = Math.sqrt(cx * cx + cy * cy);

    function applyLevels(clientX: number, clientY: number) {
      const dx = clientX - cx;
      const dy = (clientY - cy) * 2;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = Math.min(dist / maxDist, 1); // 0 centro → 1 bordes
      const tInverted = 1 - t;

      const contrast = gsap.utils.interpolate(1.1, 1.5, tInverted);
      const brightness = gsap.utils.interpolate(0.92, 2, tInverted);

      setFilter(`contrast(${contrast}) brightness(${brightness})`);
    }

    // estado inicial coherente
    applyLevels(cx, cyi);

    function onMove(e: MouseEvent) {
      applyLevels(e.clientX, e.clientY);
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // 🎥 fade-in SOLO cuando el video esté listo
  function handleVideoReady() {
    if (!wrapperRef.current || hasShownRef.current) return;

    hasShownRef.current = true;

    gsap.to(wrapperRef.current, {
      opacity: 1,
      duration: 4,
      ease: "power3.out",
    });
  }

  return (
    <div
      ref={wrapperRef}
      className="index-bg fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >

      {/* NOISE VIDEO */}
      <video
        src="/noise-loop_1.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover mix-blend-hard-light opacity-40"
      />
      {/* FRACTAL VIDEO */}
      <video
        src="/bg-loop-fractal-9s.mp4"
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={handleVideoReady}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

    </div>
  );
}
