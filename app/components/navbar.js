"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Clock from "./clock";
import { useInfoPanel } from "./InfoPanelContext";

export default function Navbar() {
  const { isInfoOpen, toggleInfo, closeInfo } = useInfoPanel();
  const pathname = usePathname();

  const navItems = [
    { href: "/indx", label: "INDEX", colStart: "col-start-1", justify: "start" },
    { href: "/", label: "ARCHIVE", colStart: "col-start-2", justify: "center" },
    { label: "INFO", colStart: "col-start-3", justify: "end", isButton: true },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-2">
      <div
        data-label="Global-holder"
        className="col-span-full grid grid-cols-2 md:grid-cols-7 gap-2 lg:gap-6 pt-2 tracking-wide font-[elza-narrow] font-medium md:text-md lg:text-lg my-2"
      >

        {/* Logo */}
        <div className="col-start-1 col-span-1 md:col-span-2 xl:col-span-1 flex justify-start items-center bg-white/40 backdrop-blur-lg rounded-2xl px-4 md:mr-10 lg:mr-20 xl:mr-0 my-0 md:my-3 text-zinc-700">
          <Link href="/" className="cursor-default">DANCUAR</Link>
        </div>

        {/* Navbar */}
        <div
          data-label="Navbar-Container"
          className="grid grid-cols-3 gap-2 col-start-1 col-span-2 md:col-span-3 md:col-start-3 lg:col-span-3 lg:col-start-3 bg-white/40 backdrop-blur-lg rounded-2xl p-4"
        >
          {navItems.map((item) => {
            const isActive = item.isButton
              ? isInfoOpen
              : !isInfoOpen && ((item.label === "ARCHIVE" && pathname === "/") || pathname === item.href);

            const justifyClass =
              item.justify === "start" ? "justify-start" :
              item.justify === "end" ? "justify-end" :
              "justify-center";

            const baseClasses =
              `group relative flex w-full items-center ${justifyClass} rounded-lg border border-zinc-300 overflow-hidden
              ${isActive ? "bg-white text-zinc-700" : "bg-zinc-100 text-zinc-400 hover:text-zinc-700 hover:bg-white"}`;

            return (
              <div key={item.label} className={item.colStart}>
                {item.isButton ? (

                  // ---------------------------------------
                  // INFO BUTTON (toggle)
                  // ---------------------------------------
                  <button
                    className={`${baseClasses} px-0 py-0 hover:cursor-pointer`}
                    onClick={toggleInfo}
                  >
                    <span className="px-4 py-1 relative z-10">{item.label}</span>

                    <div className={`absolute inset-0 rounded-lg border-2 blur-[2px] border-zinc-400 z-0
                      ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} 
                      transition-opacity duration-300`}
                    />
                  </button>

                ) : (

                  // ---------------------------------------
                  // INDEX / ARCHIVE:
                  // Si InfoPanel está abierto y ya estamos en la misma ruta → NO navegar
                  // ---------------------------------------
                  isInfoOpen && pathname === item.href ? (
                    <button
                      className={baseClasses}
                      onClick={closeInfo}
                    >
                      <span className="px-4 py-1 relative z-10">{item.label}</span>

                      <div className={`absolute inset-0 rounded-lg border-2 blur-[2px] border-zinc-400 z-0
                        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} 
                        transition-opacity duration-300`}
                      />
                    </button>
                  ) : (
                    <Link href={item.href} className={baseClasses}>
                      <span className="px-4 md:px-2 lg:px-4 py-1 relative z-10">{item.label}</span>

                      <div className={`absolute inset-0 rounded-lg border-2 blur-[2px] border-zinc-400 z-0
                        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} 
                        transition-opacity duration-300`}
                      />
                    </Link>
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* Clock */}
        <div className="col-start-2 row-start-1 col-span-1 md:col-start-6 md:col-span-2 lg:col-start-6 xl:col-start-7 lg:col-span-2 xl:col-span-1 flex justify-end items-center bg-white/40 backdrop-blur-lg rounded-2xl px-4 md:ml-10 lg:ml-20 xl:ml-0 my-0 md:my-3 text-zinc-700 cursor-default">
          <Clock timeZone="America/Bogota" />
        </div>
      </div>
    </div>
  );
}
