"use client";
import { useState, useEffect } from "react";

export default function Clock({ timeZone }) {
  const [time, setTime] = useState("");

  const tz = timeZone || "America/Bogota";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("es-CO", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // ✅ 24h militar
      });
      // 🚀 en vez de confiar en el navegador para la zona, lo forzamos
      setTime(`${formatted} UTC-5`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [tz]);

  return <span>{time}</span>;
}