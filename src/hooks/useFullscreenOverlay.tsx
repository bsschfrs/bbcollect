import { createContext, useContext, useState, ReactNode } from 'react';

interface FullscreenOverlayContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const FullscreenOverlayContext = createContext<FullscreenOverlayContextType | undefined>(undefined);

export function FullscreenOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <FullscreenOverlayContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </FullscreenOverlayContext.Provider>
  );
}

export function useFullscreenOverlay() {
  const ctx = useContext(FullscreenOverlayContext);
  if (!ctx) throw new Error('useFullscreenOverlay must be used within FullscreenOverlayProvider');
  return ctx;
}
