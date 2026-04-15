'use client';

import React, { useState, Suspense } from 'react';
import Sidebar from './Sidebar';
import Icon from '@/components/ui/AppIcon';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'client' | 'provider' | 'admin';
}

export default function AppLayout({ children, userRole = 'client' }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`fixed lg:relative z-40 lg:z-auto h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Suspense fallback={<div className="w-60 bg-[#1E3A5F] h-screen shrink-0" />}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            userRole={userRole}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </Suspense>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-thin transition-all duration-300 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 bg-[#1E3A5F] px-4 py-3 sticky top-0 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Abrir menú"
          >
            <Icon name="Bars3Icon" size={22} />
          </button>
          <span className="font-bold text-white text-base tracking-tight">Eficia</span>
        </div>
        {children}
      </main>
    </div>
  );
}