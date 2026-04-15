'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface KPI {
  id: string;
  label: string;
  value: string;
  subValue: string;
  icon: string;
  trendUp: boolean | null;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function AdminKPICards() {
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const fetchKpis = async () => {
      const [
        { count: clientsCount },
        { count: providersCount },
        { count: pendingCount },
        { count: leadsCount },
        { count: categoriesCount },
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente'),
        supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'aprobado'),
        supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }).eq('active', true),
      ]);

      setKpis([
        {
          id: 'akpi-users',
          label: 'Empresas clientes',
          value: String(clientsCount || 0),
          subValue: 'registradas en la plataforma',
          icon: 'UsersIcon',
          trendUp: (clientsCount || 0) > 0 ? true : null,
          color: '#1E3A5F',
          bgColor: '#EEF2F8',
          borderColor: '#A8BDD9',
        },
        {
          id: 'akpi-providers-total',
          label: 'Proveedores activos',
          value: String(providersCount || 0),
          subValue: `${pendingCount || 0} pendientes aprobación`,
          icon: 'BuildingStorefrontIcon',
          trendUp: (providersCount || 0) > 0 ? true : null,
          color: '#38A169',
          bgColor: '#F0FBF4',
          borderColor: '#A3EBC2',
        },
        {
          id: 'akpi-pending',
          label: 'Pendientes aprobación',
          value: String(pendingCount || 0),
          subValue: 'Requieren revisión',
          icon: 'ClockIcon',
          trendUp: (pendingCount || 0) > 0 ? false : null,
          color: '#F97316',
          bgColor: '#FFF7ED',
          borderColor: '#FED7AA',
        },
        {
          id: 'akpi-leads',
          label: 'Leads totales',
          value: String(leadsCount || 0),
          subValue: 'en la plataforma',
          icon: 'EnvelopeIcon',
          trendUp: (leadsCount || 0) > 0 ? true : null,
          color: '#3B82F6',
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        },
        {
          id: 'akpi-categories',
          label: 'Categorías activas',
          value: String(categoriesCount || 0),
          subValue: 'operativas',
          icon: 'TagIcon',
          trendUp: null,
          color: '#8B5CF6',
          bgColor: '#F5F3FF',
          borderColor: '#DDD6FE',
        },
      ]);
    };

    fetchKpis();
  }, []);

  if (kpis.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-card animate-pulse">
            <div className="w-9 h-9 bg-[#F5F7FA] rounded-xl mb-3" />
            <div className="h-7 bg-[#F5F7FA] rounded w-1/2 mb-1" />
            <div className="h-3 bg-[#F5F7FA] rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-2">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="bg-white rounded-xl border p-4 shadow-card" style={{ borderColor: kpi.borderColor }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bgColor }}>
              <Icon name={kpi.icon as 'HomeIcon'} size={18} style={{ color: kpi.color }} className="" />
            </div>
            {kpi.trendUp !== null && (
              <Icon name={kpi.trendUp ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={14} className={kpi.trendUp ? 'text-[#38A169]' : 'text-red-500'} />
            )}
          </div>
          <p className="text-2xl font-bold font-tabular mb-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          <p className="text-xs font-semibold text-[#718096] leading-tight">{kpi.label}</p>
          <p className="text-xs text-[#A0AEC0] mt-1 leading-tight">{kpi.subValue}</p>
        </div>
      ))}
    </div>
  );
}