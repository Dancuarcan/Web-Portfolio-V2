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

  const [activeItem, setActiveItem] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);
  const hideTimeout = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedItems, setLoadedItems] = useState(new Set());

  const videoCache = useRef(new Map());

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Refresh Lenis on media load
  useEffect(() => {
    if (!containerRef.current || isLoading) return;
    const refresh = () => window.__lenis?.resize();

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

  // Fade-in + blur on scroll
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

  // Lazy video load + placeholder
  useEffect(() => {
    if (!containerRef.current) return;
    const videos = containerRef.current.querySelectorAll("video[data-src]");

    videos.forEach((video) => {
      const parentDiv = video.parentElement;

      if (isMobile) {
        const observer = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !video.src) {
                video.src = video.dataset.src;
                video.load();
                obs.unobserve(video);
              }
            });
          },
          { root: null, rootMargin: "200% 0px", threshold: 0.01 }
        );
        observer.observe(video);
      }

      if (!isMobile) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const vid = entry.target;
              if (!(vid instanceof HTMLVideoElement)) return;

              if (entry.isIntersecting) {
                if (!vid.src) {
                  vid.src = vid.dataset.src;
                  vid.load();
                }
                vid.play().catch(() => {});
              } else {
                vid.pause();
              }
            });
          },
          { root: null, rootMargin: "25% 0px", threshold: 1 }
        );
        observer.observe(video);
      }

      video.addEventListener("canplaythrough", () => {
        if (parentDiv) {
          const placeholder = parentDiv.querySelector(".video-placeholder");
          if (placeholder) placeholder.style.display = "none";
        }
        setLoadedItems((prev) => new Set(prev).add(video.dataset.src));

        if (!videoCache.current.has(video.dataset.src)) {
          videoCache.current.set(video.dataset.src, video);
        }
      });
    });
  }, [isMobile]);

  // Mobile: active = closest to center
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

  // Security
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

  // Click handler para FocusLayer instantáneo
  const handleClickItem = (item) => {
    if (item.type.toLowerCase() === "video" && !loadedItems.has(item.src)) {
      let vid;
      if (videoCache.current.has(item.src)) {
        vid = videoCache.current.get(item.src);
      } else {
        vid = document.createElement("video");
        vid.src = item.src;
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.preload = "auto";
        videoCache.current.set(item.src, vid);
      }

      setLoadedItems((prev) => new Set(prev).add(item.src));
    }

    setFocusedItem((prev) => (prev === item ? null : item));
  };

  return (
    <>
      <FocusLayer
        item={focusedItem}
        onClose={() => setFocusedItem(null)}
        loadedItems={loadedItems}
        videoCache={videoCache.current}
      />

      <main
        ref={containerRef}
        className="col-span-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-12 mt-50 mx-6 pb-40"
      >
        <MicrodataPanel data={focusedItem || activeItem} />

        {archiveItems.map((item, i) => (
          <div
            key={i}
            className="archive-item relative cursor-pointer flex justify-center items-center"
            onMouseEnter={() => {
              if (focusedItem || isMobile) return;
              clearTimeout(hideTimeout.current);
              setActiveItem(item);
            }}
            onMouseLeave={() => {
              if (focusedItem || isMobile) return;
              hideTimeout.current = setTimeout(() => setActiveItem(null), 120);
            }}
            onClick={() => handleClickItem(item)}
          >
            {item.type.toLowerCase() === "image" ? (
              <div className="relative bg-zinc-200 overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="/placeholder.png"
                />
              </div>
            ) : (
              <div className="relative bg-zinc-200 overflow-hidden">
                {!loadedItems.has(item.src) && (
                  <div className="absolute inset-0 bg-zinc-200 video-placeholder" />
                )}
                <video
                  data-src={item.src}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </main>
    </>
  );
}
