"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function FocusLayer({ item, onClose, videoCache }) {
  const layerRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);

  // ---------------------------------------------------------
  // 🔒 Scroll lock
  // ---------------------------------------------------------
  useEffect(() => {
    if (!item) return;

    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();

    return () => {
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
    };
  }, [item]);

  // ---------------------------------------------------------
  // ⌨️ ESC close
  // ---------------------------------------------------------
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  // ---------------------------------------------------------
  // 🎬 Enter animation
  // ---------------------------------------------------------
  useEffect(() => {
    if (!item) return;

    gsap.fromTo(
      layerRef.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.25, ease: "power2.out" }
    );

    gsap.fromTo(
      mediaRef.current,
      { scale: 0.96 },
      { scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, [item]);

  // ---------------------------------------------------------
  // 🔄 Montar video desde cache sin alterar layout
  // ---------------------------------------------------------
  useEffect(() => {
    if (!item || item.type.toLowerCase() !== "video") return;

    const container = mediaRef.current;
    if (!container) return;

    // Limpiar video previo
    container.querySelectorAll("video").forEach((v) => container.removeChild(v));

    let video;
    if (videoCache && videoCache.has(item.src)) {
      // Clonar desde cache
      video = videoCache.get(item.src).cloneNode(true);
    } else {
      // Si no existe en cache, crear uno nuevo y guardarlo
      video = document.createElement("video");
      video.src = item.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      if (videoCache) videoCache.set(item.src, video);
    }

    video.className = "w-auto h-auto max-h-[75vh] max-w-[90vw] object-contain";
    container.appendChild(video);
    videoRef.current = video;

    // Autoplay
    video.play().catch(() => {});
  }, [item, videoCache]);

  // ---------------------------------------------------------
  // 🔊 AUDIO fade-in / fade-out
  // ---------------------------------------------------------
  useEffect(() => {
    if (!item || item.type.toLowerCase() !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 0;

    gsap.to(video, {
      volume: 0.4,
      duration: 0.4,
      ease: "power2.out",
    });

    return () => {
      gsap.to(video, {
        volume: 0,
        duration: 0.25,
        onComplete: () => {
          video.muted = true;
        },
      });
    };
  }, [item]);

  // ---------------------------------------------------------
  if (!item) return null;

  return (
    <div
      ref={layerRef}
      className="
        fixed inset-0 z-4
        flex items-center justify-center
        bg-white/40 backdrop-blur-xl
        cursor-pointer pb-3 md:pt-3 
      "
      onClick={onClose}
    >
      <div
        ref={mediaRef}
        className="flex items-center justify-center max-w-[90vw] max-h-[75vh]"
      >
        {item.type.toLowerCase() === "image" && (
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            className="w-auto h-auto max-h-[75vh] max-w-[90vw] object-contain"
            priority
          />
        )}
        {/* El video se monta dinámicamente desde cache en useEffect */}
      </div>
    </div>
  );
}
