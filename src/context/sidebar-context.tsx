"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  width: number;
  setWidth: (value: number) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebar-width");
    const savedCollapsed = localStorage.getItem("sidebar-collapsed");
    
    if (savedWidth) {
      const w = parseInt(savedWidth, 10);
      if (w > 60) setWidth(w);
    }
    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", newState.toString());
      return newState;
    });
  };

  const handleSetWidth = (newWidth: number) => {
    setWidth(newWidth);
    if (!isCollapsed && newWidth > 60) {
      localStorage.setItem("sidebar-width", newWidth.toString());
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        width,
        setWidth: handleSetWidth,
        isResizing,
        setIsResizing,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
