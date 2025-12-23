"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64px quando colapsado, 256px quando expandido

  useEffect(() => {
    const checkSidebarState = () => {
      const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
      setSidebarWidth(isCollapsed ? 64 : 256);
    };

    checkSidebarState();
    
    // Ouvir mudanças no localStorage (storage event só funciona entre abas)
    const handleStorageChange = () => {
      checkSidebarState();
    };
    
    // Evento customizado para mudanças na mesma aba
    const handleSidebarToggle = () => {
      checkSidebarState();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    
    // Verificar periodicamente (fallback)
    const interval = setInterval(checkSidebarState, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main 
        className="transition-all duration-300 p-6" 
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {children}
      </main>
    </div>
  );
}

