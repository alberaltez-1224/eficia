'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import ClientKPICards from './ClientKPICards';
import AnalysesTable from './AnalysesTable';
import LeadsPipeline from './LeadsPipeline';
import QuickStartCategories from './QuickStartCategories';
import SavingsTrendChart from './SavingsTrendChart';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function ClientDashboardContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analyses' | 'leads'>('overview');
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState<string>('');
  const [pendingLeads, setPendingLeads] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('company_name, id')
        .eq('user_id', user.id)
        .single();

      if (company) {
        setCompanyName(company.company_name);
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .in('status', ['nuevo', 'en_proceso']);
        setPendingLeads(count || 0);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 lg:px-8 xl:px-10 py-5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Panel de empresa</h1>
            <p className="text-sm text-[#718096] mt-0.5">
              Bienvenida, <span className="font-semibold text-[#2D3748]">{companyName || 'Tu empresa'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#718096] hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 transition-all relative">
                <Icon name="BellIcon" size={20} />
                {pendingLeads > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
            </div>
            <Link
              href="/savings-calculator"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95"
            >
              <Icon name="PlusIcon" size={16} />
              Nuevo análisis
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-8">
        {/* Alert banner */}
        {pendingLeads > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{pendingLeads} solicitud{pendingLeads > 1 ? 'es' : ''} pendiente{pendingLeads > 1 ? 's' : ''}</p>
              <p className="text-sm text-amber-700">Tienes solicitudes enviadas a proveedores esperando respuesta.</p>
            </div>
            <button onClick={() => setActiveTab('leads')} className="text-xs font-semibold text-amber-600 hover:text-amber-800 shrink-0">Ver solicitudes</button>
          </div>
        )}

        {/* KPI Cards */}
        <ClientKPICards />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E2E8F0] p-1 mb-6 w-fit shadow-card">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'analyses', label: 'Mis análisis' },
            { id: 'leads', label: 'Mis solicitudes' },
          ].map((tab) => (
            <button
              key={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-[#1E3A5F] text-white'
                  : 'text-[#718096] hover:text-[#2D3748]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <SavingsTrendChart />
              <AnalysesTable compact />
            </div>
            <div className="space-y-6">
              <QuickStartCategories />
              <LeadsPipeline compact />
            </div>
          </div>
        )}

        {activeTab === 'analyses' && (
          <AnalysesTable />
        )}

        {activeTab === 'leads' && (
          <LeadsPipeline />
        )}
      </div>
    </div>
  );
}