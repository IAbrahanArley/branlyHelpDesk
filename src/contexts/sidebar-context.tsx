"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-open");
      if (saved !== null) {
        return saved === "true";
      }
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isOpen) {
        const saved = localStorage.getItem("sidebar-open");
        if (saved === null) {
          setIsOpen(true);
        }
      } else if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-open", String(isOpen));
    }
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

