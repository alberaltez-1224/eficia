'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import ProviderKPICards from './ProviderKPICards';
import ProviderLeadsTable from './ProviderLeadsTable';
import ProviderProfileEditor from './ProviderProfileEditor';
import ProviderCategoryBadges from './ProviderCategoryBadges';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type PanelTab = 'leads' | 'profile' | 'categories' | 'stats';

export default function ProviderPanelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get('tab') as PanelTab | null;
  const activeTab: PanelTab = rawTab && ['leads', 'profile', 'categories', 'stats'].includes(rawTab) ? rawTab : 'leads';

  const { user } = useAuth();
  const [providerName, setProviderName] = useState<string>('');
  const [providerStatus, setProviderStatus] = useState<string>('pendiente');
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [profileComplete] = useState(72);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, company_name, status')
        .eq('user_id', user.id)
        .single();

      if (provider) {
        setProviderName(provider.company_name);
        setProviderStatus(provider.status);

        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', provider.id)
          .eq('status', 'nuevo');
        setNewLeadsCount(count || 0);
      }
    };

    fetchData();
  }, [user]);

  const setActiveTab = (tab: PanelTab) => {
    router.push(`/provider-panel?tab=${tab}`);
  };

  const statusLabel = providerStatus === 'verificado' ? 'Verificado' : providerStatus === 'pendiente' ? 'Pendiente de verificación' : providerStatus;
  const statusColor = providerStatus === 'verificado' ? 'text-[#38A169]' : 'text-amber-500';

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] truncate">Panel de proveedor</h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
              <span className="font-semibold text-[#2D3748]">{providerName || 'Tu empresa'}</span>
              <span className="hidden sm:inline"> · Estado: <span className={`font-semibold ${statusColor}`}>{statusLabel}</span></span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Icon name="ExclamationCircleIcon" size={16} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">Perfil {profileComplete}% completo</span>
            </div>
            <button className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#718096] hover:text-[#1E3A5F] relative transition-all">
              <Icon name="BellIcon" size={20} />
              {newLeadsCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#38A169] rounded-full" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8">
        {/* Profile completeness banner */}
        {profileComplete < 100 && (
          <div className="mb-5 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#2D3748]">Completa tu perfil para aparecer mejor posicionado</p>
              <span className="text-sm font-bold text-[#1E3A5F]">{profileComplete}%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] rounded-full h-2 mb-2">
              <div
                className="bg-[#38A169] h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileComplete}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-[#718096]">
              <span className="flex items-center gap-1 text-[#38A169]"><Icon name="CheckIcon" size={11} />Datos básicos</span>
              <span className="flex items-center gap-1 text-[#38A169]"><Icon name="CheckIcon" size={11} />Categorías</span>
              <span className="flex items-center gap-1 text-amber-500"><Icon name="ExclamationCircleIcon" size={11} />Logo pendiente</span>
              <span className="flex items-center gap-1 text-amber-500"><Icon name="ExclamationCircleIcon" size={11} />Casos de éxito</span>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <ProviderKPICards />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E2E8F0] p-1 mb-6 shadow-card overflow-x-auto">
          {[
            { id: 'leads', label: 'Leads', badge: newLeadsCount > 0 ? newLeadsCount : null },
            { id: 'profile', label: 'Mi perfil' },
            { id: 'categories', label: 'Categorías' },
            { id: 'stats', label: 'Estadísticas' },
          ].map((tab) => (
            <button
              key={`ptab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as PanelTab)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1E3A5F] text-white'
                  : 'text-[#718096] hover:text-[#2D3748]'
              }`}
            >
              {tab.label}
              {tab.badge !== null && tab.badge !== undefined && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#38A169] text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'leads' && <ProviderLeadsTable />}
        {activeTab === 'profile' && <ProviderProfileEditor />}
        {activeTab === 'categories' && <ProviderCategoryBadges />}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-[#EEF2F8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="ChartBarIcon" size={32} className="text-[#1E3A5F]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D3748] mb-2">Estadísticas disponibles próximamente</h3>
            <p className="text-sm text-[#718096]">Aquí podrás ver métricas detalladas de rendimiento, conversión de leads y comparativas del sector.</p>
          </div>
        )}
      </div>
    </div>
  );
}