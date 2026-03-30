"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  FileJson, 
  Database,
  Mail,
  HelpCircle
} from "lucide-react";
import { useSidebar } from "~/context/sidebar-context";
import { SidebarItem } from "./sidebar-item";
import ROUTES from "~/routes";

export const Sidebar: React.FC = () => {
  const { 
    isCollapsed, 
    width, 
    setWidth, 
    isResizing, 
    setIsResizing,
    toggleSidebar 
  } = useSidebar();
  
  const sidebarRef = useRef<HTMLElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, [setIsResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && !isCollapsed) {
      let newWidth = e.clientX;
      if (newWidth < 220) newWidth = 220;
      if (newWidth > 450) newWidth = 450;
      setWidth(newWidth);
    }
  }, [isResizing, isCollapsed, setWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const displayWidth = isCollapsed ? 76 : width;

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${displayWidth}px` }}
      className={`
        flex-shrink-0 flex-grow-0
        relative h-screen flex flex-col
        bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 z-[100]
        ${isResizing ? "transition-none select-none" : "transition-[width] duration-500 cubic-bezier(0.4, 0, 0.2, 1)"}
      `}
    >
      {/* Premium Inner Glow (Soft Light) */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-slate-200/30 to-transparent pointer-events-none" />

      {/* Header / Logo */}
      <div className="h-20 flex items-center px-5 border-b border-slate-200/60 shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-[0_4px_15px_rgba(79,70,229,0.2)] shrink-0 group-hover:scale-105 transition-transform">
            <BarChart3 size={22} className="text-white" />
          </div>
          <span className={`
            font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 whitespace-nowrap transition-all duration-500
            ${isCollapsed ? "opacity-0 translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"}
          `}>
            Excel Convert
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 space-y-2 mt-6 custom-scrollbar">
        <div className="space-y-1.5">
          <div className={`
            px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-all duration-500
            ${isCollapsed ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"}
          `}>
            {isCollapsed ? "" : "Main Dashboard"}
          </div>
          
          <SidebarItem icon={Home} label="Dashboard" href={ROUTES.HOME} />
          <SidebarItem icon={FileJson} label="Converter" href="/converter" />
          <SidebarItem icon={Database} label="History" href="/history" />
        </div>

        <div className="space-y-1.5 pt-8">
          <div className={`
            px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-all duration-500
            ${isCollapsed ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"}
          `}>
            {isCollapsed ? "" : "Application"}
          </div>
          <SidebarItem icon={Mail} label="Messages" href="/messages" />
          <SidebarItem icon={Settings} label="Settings" href="/settings" />
          <SidebarItem icon={HelpCircle} label="Support" href="/help" />
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-200/60 shrink-0 transition-all duration-500">
        <div className={`
          flex items-center gap-3 p-2 rounded-2xl transition-all duration-500
          ${isCollapsed ? "justify-center bg-transparent" : "bg-slate-100/50 border border-slate-200/50 hover:bg-slate-100/80"}
        `}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center font-bold text-sm uppercase shadow-md shadow-indigo-500/10 shrink-0 border border-white">
            KS
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-500 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
            <p className="text-sm font-semibold truncate text-slate-900">Khanh Son</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border border-white text-white shadow-[0_2px_10px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:scale-110 transition-all z-[110]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>


      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={startResizing}
          className={`
            absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-slate-300 transition-colors z-[105]
            ${isResizing ? "bg-indigo-500 w-[2px]" : "bg-transparent"}
          `}
        />
      )}
    </aside>
  );
};

