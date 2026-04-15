'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface KPI {
  id: string;
  label: string;
  value: string;
  subValue: string;
  icon: string;
  trend: string;
  trendUp: boolean;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function ProviderKPICards() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchKpis = async () => {
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!provider) return;

      const [{ count: totalLeads }, { count: pendingLeads }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id).eq('status', 'nuevo'),
      ]);

      setKpis([
        {
          id: 'pkpi-leads',
          label: 'Leads recibidos',
          value: String(totalLeads || 0),
          subValue: 'total acumulado',
          icon: 'EnvelopeIcon',
          trend: 'Total histórico',
          trendUp: (totalLeads || 0) > 0,
          color: '#1E3A5F',
          bgColor: '#EEF2F8',
          borderColor: '#A8BDD9',
        },
        {
          id: 'pkpi-pending',
          label: 'Leads pendientes',
          value: String(pendingLeads || 0),
          subValue: 'sin responder',
          icon: 'ExclamationCircleIcon',
          trend: (pendingLeads || 0) > 0 ? 'Requieren atención' : 'Al día',
          trendUp: (pendingLeads || 0) === 0,
          color: '#F97316',
          bgColor: '#FFF7ED',
          borderColor: '#FED7AA',
        },
      ]);
    };

    fetchKpis();
  }, [user]);

  if (kpis.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card animate-pulse">
            <div className="w-10 h-10 bg-[#F5F7FA] rounded-xl mb-3" />
            <div className="h-8 bg-[#F5F7FA] rounded w-1/3 mb-1" />
            <div className="h-3 bg-[#F5F7FA] rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="bg-white rounded-xl border p-5 shadow-card" style={{ borderColor: kpi.borderColor }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bgColor }}>
              <Icon name={kpi.icon as 'HomeIcon'} size={20} style={{ color: kpi.color }} className="" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${kpi.trendUp ? 'bg-[#F0FBF4] text-[#38A169]' : 'bg-red-50 text-red-500'}`}>
              <Icon name={kpi.trendUp ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={10} />
              {kpi.trendUp ? 'Bien' : 'Atención'}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-1">{kpi.label}</p>
          <p className="text-3xl font-bold font-tabular mb-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          <p className="text-xs text-[#718096]">{kpi.subValue}</p>
          <p className="text-xs text-[#A0AEC0] mt-1.5">{kpi.trend}</p>
        </div>
      ))}
    </div>
  );
}