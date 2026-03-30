"use client";

import React from "react";
import { SidebarProvider } from "~/context/sidebar-context";
import { Sidebar } from "./sidebar";

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
        <Sidebar />
        <main className="flex-1 overflow-auto relative custom-scrollbar bg-white/40 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
