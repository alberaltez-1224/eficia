'use client';

import React, { useState, Suspense } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'client' | 'provider' | 'admin';
}

export default function AppLayout({ children, userRole = 'client' }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Suspense fallback={<div className="w-60 bg-[#1E3A5F] h-screen shrink-0" />}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          userRole={userRole}
        />
      </Suspense>
      <main
        className="flex-1 overflow-y-auto scrollbar-thin transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        {children}
      </main>
    </div>
  );
}