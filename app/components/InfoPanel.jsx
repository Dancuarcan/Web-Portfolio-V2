"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import Lenis from "@studio-freight/lenis";
import { useInfoPanel } from "./InfoPanelContext";

export default function InfoPanel() {
  const { isInfoOpen, closeInfo } = useInfoPanel();
  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const ioRef = useRef(null);
  const lenisRef = useRef(null);

  // ---------------------------------------------------------
  // 1. CLOSE ON CLICK OUTSIDE + ESC
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInfoOpen) return;

    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closeInfo();
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") closeInfo();
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isInfoOpen, closeInfo]);

  // ---------------------------------------------------------
  // 2. LENIS (smooth scroll)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInfoOpen) return;

    const scrollEl = document.getElementById("info-scroll");
    if (!scrollEl) return;

    const lenis = new Lenis({
      wrapper: scrollEl,
      content: scrollEl,
      wheelMultiplier: 0.7,   // MÁS RÁPIDO
      touchMultiplier: 0.8,
      lerp: 0.16,             // MÁS FLUIDO
      smoothWheel: true,
      smoothTouch: true,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [isInfoOpen]);

  // ---------------------------------------------------------
  // 3. FADE + BLUR DEL FONDO + FADEIN DE CONTENIDO
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInfoOpen || !panelRef.current) return;

    const wrapper = document.getElementById("info-scroll");
    const items = panelRef.current.querySelectorAll(".fade-in-item");

    gsap.set(wrapper, {
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(255,255,255,0)",
      autoAlpha: 0,
    });

    gsap.set(items, { autoAlpha: 0, y: 40, filter: "blur(25px)" });

    // ANIMACIÓN DE ENTRADA
    gsap.timeline()
      .to(wrapper, {
        autoAlpha: 1,
        backdropFilter: "blur(30px)",
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        duration: 0.6,
        ease: "power3.out",
      })
      .to(
        items,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.05,
        },
        "-=0.2"
      );
  }, [isInfoOpen]);

  // ---------------------------------------------------------
  // 4. FADE OUT COMPLETO
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInfoOpen && panelRef.current) {
      const wrapper = document.getElementById("info-scroll");
      if (!wrapper) return; // <=== FIX 🔥
      const items = panelRef.current.querySelectorAll(".fade-in-item");

      gsap.to(items, {
        autoAlpha: 0,
        y: 20,
        filter: "blur(25px)",
        duration: 0.4,
        ease: "power2.in",
      });

      gsap.to(wrapper, {
        backdropFilter: "blur(0px)",
        backgroundColor: "rgba(255,255,255,0)",
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
      });
    }
  }, [isInfoOpen]);

  // ---------------------------------------------------------
  // 5. INTERSECTION OBSERVER (blur dinámico)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInfoOpen || !panelRef.current) return;

    const targets = Array.from(
      panelRef.current.querySelectorAll(".fade-in-item")
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            gsap.to(el, {
              filter: "blur(0px)",
              opacity: 1,
              duration: 0.35,
              ease: "power2.out",
            });
          } else {
            gsap.to(el, {
              filter: "blur(22px)",
              opacity: 0.35,
              duration: 0.4,
              ease: "power2.in",
            });
          }
        });
      },
      {
        root: document.getElementById("info-scroll"),
        rootMargin: "-5% 0px -5% 0px",
        threshold: 0,
      }
    );

    ioRef.current = io;
    targets.forEach((t) => io.observe(t));

    return () => io.disconnect();
  }, [isInfoOpen]);

  // ---------------------------------------------------------

  if (!isInfoOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-full max-h-full z-40">
      <div
        id="info-scroll"
        className="relative max-h-full h-full col-span-full grid grid-cols-2 md:grid-cols-7 
                   gap-2 lg:gap-6 pt-2 lg:pt-2 tracking-wide font-[elza-narrow] 
                   font-medium text-lg py-2 bg-white/50 backdrop-blur-2xl 
                   overflow-y-auto scrollbar-hide"
      >
        <div
          ref={panelRef}
          className="absolute top-0 max-h-full max-w-[850px] h-full w-full flex flex-col gap-2 
                     col-start-1 col-span-2 md:col-span-5 md:col-start-2 
                     xl:col-span-3 xl:col-start-3 p-6"
        >
          <div className="info flex flex-col w-full pt-100">

            {/* ABOUT */}
            <span className="fade-in-item text-center font-[paradroid-mono-soft] text-sm mb-2">
              ABOUT
            </span>
            <span className="fade-in-item text-justify text-2xl font-bold mb-16">
              Hello! I'm Daniel, a graphic designer and multidisciplinary artist.
              Very passionate for visual exploration and achieving something new
              and refreshing.
            </span>

            {/* WEBSITE */}
            <span className="fade-in-item text-center font-[paradroid-mono-soft] text-sm mb-2">
              WEBSITE
            </span>
            <span className="fade-in-item text-justify text-2xl font-bold mb-16">
              This was a project developed by me; with love, inspiration from others' work, and lots of research.
              It's still in progress and updates are coming... <Link className="text-2xl font-bold text-zinc-500 hover:text-black transition"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.are.na/share/KZtDbhS">Changelog</Link>
            </span>

            {/* SERVICES */}
            <span className="fade-in-item text-center font-[paradroid-mono-soft] text-sm mb-2">
              SERVICES
            </span>
            <span className="fade-in-item text-center text-2xl font-bold mb-2"> Animation</span>
            <span className="fade-in-item text-center text-2xl font-bold mb-2"> Photography</span>
            <span className="fade-in-item text-center text-2xl font-bold mb-2"> Editorial</span>
            <span className="fade-in-item text-center text-2xl font-bold mb-16"> Web</span>

            {/* EXPERIENCE */}
            <span className="fade-in-item text-center font-[paradroid-mono-soft] text-sm mb-2">
              EXPERIENCE
            </span>
            <span className="fade-in-item text-center text-2xl font-bold mb-2">
              Freelancer {"(2023-Current)"}
            </span>
             <span className="fade-in-item text-center text-2xl font-bold mb-16">
              Intern at <Link className="text-2xl font-bold text-zinc-500 hover:text-black transition"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/folk_estudio/">Folk Estudio</Link> {"(2024-2025)"}
            </span>

            {/* CONTACT */}
            <span className="fade-in-item text-center font-[paradroid-mono-soft] text-sm mb-8">
              CONTACT
            </span>
            {/* SOCIALS */}
            <div className="fade-in-item socials flex flex-row justify-between mb-120">
              <Link className="text-2xl font-bold text-zinc-500 hover:text-black transition"
              target="_blank"
              rel="noopener noreferrer" href="mailto:dancuar.design@gmail.com">Mail</Link>
              <Link className="text-2xl font-bold text-zinc-500 hover:text-black transition"
              target="_blank"
              rel="noopener noreferrer" href="https://www.instagram.com/dancuar/">Instagram</Link>
              <Link className="text-2xl font-bold text-zinc-500 hover:text-black transition"
              target="_blank"
              rel="noopener noreferrer" href="https://www.are.na/dan-cuartas/">Are.na</Link>
              <Link className="text-2xl font-bold text-zinc-500 hover:text-black transition"
              target="_blank"
              rel="noopener noreferrer" href="mailto:dancuar.design@gmail.com">CV</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
