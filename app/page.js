"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { archiveItems } from "../data/archive";
import gsap from "gsap";
import { useLoading } from "../app/components/LoadingProvider";
import MicrodataPanel from "../app/components/MicrodataPanel";
import FocusLayer from "../app/components/FocusLayer";

export default function ArchivePage() {
  const containerRef = useRef(null);
  const { isLoading } = useLoading();

  // Hover
  const [activeItem, setActiveItem] = useState(null);

  // Focus (click)
  const [focusedItem, setFocusedItem] = useState(null);

  const hideTimeout = useRef(null);

  // Mobile detect
  const [isMobile, setIsMobile] = useState(false);

  // ---------------------------------------------------------
  // 0) Detect mobile
  // ---------------------------------------------------------
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------------------------------------------------------
  // 1) Refresh Lenis on media load
  // ---------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    const refresh = () => {
      if (window.__lenis) window.__lenis.resize();
    };

    const imgs = containerRef.current.querySelectorAll("img");
    const vids = containerRef.current.querySelectorAll("video");

    imgs.forEach((img) => img.addEventListener("load", refresh));
    vids.forEach((v) => v.addEventListener("loadeddata", refresh));

    refresh();

    return () => {
      imgs.forEach((img) => img.removeEventListener("load", refresh));
      vids.forEach((v) => v.removeEventListener("loadeddata", refresh));
    };
  }, [isLoading]);

  // ---------------------------------------------------------
  // 2) Fade-in + blur on scroll
  // ---------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    const items = containerRef.current.querySelectorAll(".archive-item");
    gsap.set(items, { autoAlpha: 0, filter: "blur(35px)" });

    const io = new IntersectionObserver(
      (entries) => {
        const entering = [];
        const leaving = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) entering.push(entry.target);
          else leaving.push(entry.target);
        });

        if (entering.length) {
          gsap.to(entering, {
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
          });
        }

        if (leaving.length) {
          gsap.to(leaving, {
            autoAlpha: 0,
            filter: "blur(35px)",
            duration: 0.2,
            ease: "power3.in",
          });
        }
      },
      { threshold: 0.05 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isLoading]);

  // ---------------------------------------------------------
  // 3) Lazy video load + play / pause
  // ---------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const videos = containerRef.current.querySelectorAll("video[data-src]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (!(video instanceof HTMLVideoElement)) return;

          if (entry.isIntersecting) {
            if (!video.src) {
              video.src = video.dataset.src;
              video.load();
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: "25% 0px",
        threshold: 1,
      }
    );

    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, []);

  // ---------------------------------------------------------
  // 4) Mobile: active = closest to center
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isMobile || focusedItem) return;

    const items = containerRef.current?.querySelectorAll(".archive-item");
    if (!items) return;

    const onScroll = () => {
      let closest = null;
      let minDist = Infinity;
      const centerY = window.innerHeight / 2;

      items.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - centerY);

        if (dist < minDist) {
          minDist = dist;
          closest = archiveItems[i];
        }
      });

      setActiveItem(closest);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, focusedItem]);

  // ---------------------------------------------------------
  // 5) Simple security features
  // ---------------------------------------------------------

  useEffect(() => {
  const disableContext = (e) => e.preventDefault();
  document.addEventListener("contextmenu", disableContext);
  return () => document.removeEventListener("contextmenu", disableContext);
}, []);

useEffect(() => {
  const preventDrag = (e) => e.preventDefault();
  document.addEventListener("dragstart", preventDrag);
  return () => document.removeEventListener("dragstart", preventDrag);
}, []);

  // ---------------------------------------------------------
  return (
    <>
      <FocusLayer item={focusedItem} onClose={() => setFocusedItem(null)} />

      <main
        ref={containerRef}
        className="
          col-span-full
          grid
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
          xl:grid-cols-5
          items-center
          gap-12
          mt-50
          mx-6
          pb-40
        "
      >
        <MicrodataPanel data={focusedItem || activeItem} />

        {archiveItems.map((item, i) => (
          <div
            key={i}
            className="archive-item relative cursor-pointer JUSTIFY"
            onMouseEnter={() => {
              if (focusedItem || isMobile) return;
              clearTimeout(hideTimeout.current);
              setActiveItem(item);
            }}
            onMouseLeave={() => {
              if (focusedItem || isMobile) return;
              hideTimeout.current = setTimeout(() => setActiveItem(null), 120);
            }}
            onClick={() => {
              setFocusedItem((prev) => (prev === item ? null : item));
            }}
          >
            {item.type.toLowerCase() === "image" ? (
              <div className="relative w-full bg-zinc-200 overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  className="w-full h-auto object-cover"
                  placeholder="blur"
                  blurDataURL="/placeholder.png"
                />
              </div>
            ) : (
              <video
                data-src={item.src}
                muted
                loop
                playsInline
                preload="none"
                poster="/placeholder.png"
                className="w-full h-auto object-cover"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload nofullscreen noplaybackrate"
              />
            )}
          </div>
        ))}
      </main>
    </>
  );
}
