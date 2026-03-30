"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useSidebar } from "~/context/sidebar-context";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href }) => {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
        isActive 
          ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-[0_2px_10px_rgba(79,70,229,0.08)]" 
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"
      )}
    >
      {/* Active side indicator */}
      {isActive && (
        <div className="absolute left-0 w-1 h-1/2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
      )}

      <Icon 
        size={20} 
        className={cn(
          "shrink-0 transition-transform duration-300",
          isActive ? "scale-110 text-indigo-600" : "group-hover:scale-110"
        )} 
      />
      
      <span className={cn(
        "font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
        isCollapsed ? "w-0 opacity-0 ml-0 transition-none" : "w-auto opacity-100 ml-0"
      )}>
        {label}
      </span>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl backdrop-blur-md">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[4px] border-transparent border-r-slate-900" />
        </div>
      )}
    </Link>
  );
};

