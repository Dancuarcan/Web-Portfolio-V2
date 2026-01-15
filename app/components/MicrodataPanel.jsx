"use client";

export default function MicrodataPanel({ data }) {
  if (!data) return null; // o versión "idle"

  return (
    <div className="fixed bottom-0 left-0 w-full z-5 px-2 pointer-events-none">
      <div className="Global-holder grid grid-cols-2 md:grid-cols-7 gap-2 lg:gap-6 py-2 my-2">
        <div className="flex justify-center col-span-full lg:col-span-5 lg:col-start-2">

          <div
            className="
              grid grid-cols-2 gap-2
              sm:flex sm:flex-wrap sm:justify-center sm:items-center
              rounded-2xl p-4
              bg-white/40
              backdrop-blur-lg
              overflow-hidden
            "
          >
            {data.alt && <Pill>{data.alt}</Pill>}
            {data.year && <Pill>{data.year}</Pill>}
            {data.category && <Pill>{data.category}</Pill>}
            {data.client && <Pill>{data.client}</Pill>}

          </div>

        </div>
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <div className="bg-zinc-100/90 rounded-xl py-2 px-4 font-mono text-xs lg:text-sm border border-zinc-200">
      {children}
    </div>
  );
}
