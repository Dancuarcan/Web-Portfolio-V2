import "./globals.css";
import Navbar from "./components/navbar";
import InfoPanel from "../app/components/InfoPanel";
import LoadingOverlay from "./components/LoadingOverlay";
import { LoadingProvider } from "./components/LoadingProvider";
import { InfoPanelProvider } from "./components/InfoPanelContext";
import ClientLenis from "./components/ClientLenis"; // cliente, usa hooks dentro

const COLS = 7;

export const metadata = {
  title: "Dancuar | Portfolio",
  description: "Portfolio de Dan Cuartas",
  icons: {
    icon: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
    shortcut: "/favicon.png?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/afv8ddm.css" />
      </head>
      <body className="antialiased overflow-x-hidden scrollbar-hide">
        <LoadingProvider>
          <InfoPanelProvider>
            {/* componente cliente que inicializa Lenis */}
            <ClientLenis />

            <main className="placeholder min-h-screen bg-white scrollbar-hide">
              <div className="Outer-margims mx-auto mx-6">
                <div data-label="Grid" className={`grid grid-cols-${COLS} gap-6`}>
                  <LoadingOverlay />
                  <Navbar />
                  <InfoPanel />

                  {/* Contenido de páginas */}
                  <main className="col-span-full">{children}</main>
                </div>
              </div>
            </main>
          </InfoPanelProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
