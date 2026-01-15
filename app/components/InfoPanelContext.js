"use client";

import { createContext, useContext, useState } from "react";

const InfoPanelContext = createContext();

export function InfoPanelProvider({ children }) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const toggleInfo = () => setIsInfoOpen((p) => !p);
  const closeInfo = () => setIsInfoOpen(false);
  const openInfo = () => setIsInfoOpen(true);

  return (
    <InfoPanelContext.Provider value={{ isInfoOpen, toggleInfo, closeInfo, openInfo }}>
      {children}
    </InfoPanelContext.Provider>
  );
}

export const useInfoPanel = () => useContext(InfoPanelContext);