'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AdminKPICards from './AdminKPICards';
import AdminProviderApproval from './AdminProviderApproval';
import AdminLeadsTable from './AdminLeadsTable';
import AdminUsersTable from './AdminUsersTable';
import AdminCategoriesPanel from './AdminCategoriesPanel';

type AdminTab = 'overview' | 'providers' | 'leads' | 'users' | 'categories';

export default function AdminPanelContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-[#1E3A5F] px-6 lg:px-8 xl:px-10 py-5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
            <p className="text-sm text-white/60 mt-0.5">Eficia · Control total de la plataforma · Última actualización: hoy 09:42</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-300">4 proveedores pendientes</span>
            </div>
            <button className="p-2.5 bg-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all relative">
              <Icon name="BellIcon" size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#162B47] border-b border-white/10 px-6 lg:px-8 xl:px-10">
        <div className="max-w-screen-2xl mx-auto flex gap-1 overflow-x-auto scrollbar-thin">
          {[
            { id: 'overview', label: 'Resumen', icon: 'HomeIcon' },
            { id: 'providers', label: 'Proveedores', icon: 'BuildingStorefrontIcon' },
            { id: 'leads', label: 'Leads', icon: 'EnvelopeIcon' },
            { id: 'users', label: 'Usuarios', icon: 'UsersIcon' },
            { id: 'categories', label: 'Categorías', icon: 'TagIcon' },
          ].map((tab) => (
            <button
              key={`atab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#68D391] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              <Icon name={tab.icon as 'HomeIcon'} size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AdminKPICards />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AdminProviderApproval compact />
              <AdminLeadsTable compact />
            </div>
          </div>
        )}
        {activeTab === 'providers' && <AdminProviderApproval />}
        {activeTab === 'leads' && <AdminLeadsTable />}
        {activeTab === 'users' && <AdminUsersTable />}
        {activeTab === 'categories' && <AdminCategoriesPanel />}
      </div>
    </div>
  );
}