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
  trendUp: boolean | null;
  color: string;
  bgColor: string;
  borderColor: string;
  featured: boolean;
}

export default function ClientKPICards() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const supabase = createClient();

    const fetchKpis = async () => {
      try {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        let leadsCount = 0;
        let totalMin = 0;
        let totalMax = 0;
        let uniqueCategories = 0;
        let analysesLength = 0;

        if (company) {
          const [{ count: lc }, { data: savings }, { data: analyses }] = await Promise.all([
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('savings').select('savings_min, savings_max').eq('company_id', company.id),
            supabase.from('savings').select('category_id').eq('company_id', company.id),
          ]);

          leadsCount = lc || 0;
          totalMin = savings?.reduce((s, r) => s + (r.savings_min || 0), 0) || 0;
          totalMax = savings?.reduce((s, r) => s + (r.savings_max || 0), 0) || 0;
          uniqueCategories = new Set(analyses?.map((a) => a.category_id)).size;
          analysesLength = analyses?.length || 0;
        }

        setKpis([
          {
            id: 'kpi-savings',
            label: 'Ahorro potencial total',
            value: totalMin > 0 ? `€${totalMin.toLocaleString('es-ES')}` : '—',
            subValue: totalMax > 0 ? `hasta €${totalMax.toLocaleString('es-ES')}` : 'Sin análisis aún',
            icon: 'CurrencyEuroIcon',
            trend: 'Basado en tus análisis',
            trendUp: totalMin > 0 ? true : null,
            color: '#38A169',
            bgColor: '#F0FBF4',
            borderColor: '#A3EBC2',
            featured: true,
          },
          {
            id: 'kpi-leads',
            label: 'Solicitudes activas',
            value: String(leadsCount),
            subValue: 'enviadas a proveedores',
            icon: 'EnvelopeIcon',
            trend: 'Total acumulado',
            trendUp: leadsCount > 0 ? true : null,
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            featured: false,
          },
          {
            id: 'kpi-categories',
            label: 'Áreas analizadas',
            value: String(uniqueCategories),
            subValue: 'de 7 disponibles',
            icon: 'TagIcon',
            trend: uniqueCategories < 7 ? `${7 - uniqueCategories} pendientes` : 'Todas analizadas',
            trendUp: null,
            color: '#8B5CF6',
            bgColor: '#F5F3FF',
            borderColor: '#DDD6FE',
            featured: false,
          },
          {
            id: 'kpi-analyses',
            label: 'Análisis completados',
            value: String(analysesLength),
            subValue: 'desde tu registro',
            icon: 'DocumentChartBarIcon',
            trend: 'Total histórico',
            trendUp: analysesLength > 0 ? true : null,
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#FDE68A',
            featured: false,
          },
        ]);
      } catch {
        // On error, still show cards with zero values
        setKpis([
          {
            id: 'kpi-savings',
            label: 'Ahorro potencial total',
            value: '—',
            subValue: 'Sin análisis aún',
            icon: 'CurrencyEuroIcon',
            trend: 'Basado en tus análisis',
            trendUp: null,
            color: '#38A169',
            bgColor: '#F0FBF4',
            borderColor: '#A3EBC2',
            featured: true,
          },
          {
            id: 'kpi-leads',
            label: 'Solicitudes activas',
            value: '0',
            subValue: 'enviadas a proveedores',
            icon: 'EnvelopeIcon',
            trend: 'Total acumulado',
            trendUp: null,
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            featured: false,
          },
          {
            id: 'kpi-categories',
            label: 'Áreas analizadas',
            value: '0',
            subValue: 'de 7 disponibles',
            icon: 'TagIcon',
            trend: '7 pendientes',
            trendUp: null,
            color: '#8B5CF6',
            bgColor: '#F5F3FF',
            borderColor: '#DDD6FE',
            featured: false,
          },
          {
            id: 'kpi-analyses',
            label: 'Análisis completados',
            value: '0',
            subValue: 'desde tu registro',
            icon: 'DocumentChartBarIcon',
            trend: 'Total histórico',
            trendUp: null,
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#FDE68A',
            featured: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card animate-pulse">
            <div className="w-10 h-10 bg-[#F5F7FA] rounded-xl mb-3" />
            <div className="h-3 bg-[#F5F7FA] rounded w-2/3 mb-2" />
            <div className="h-8 bg-[#F5F7FA] rounded w-1/2 mb-1" />
            <div className="h-3 bg-[#F5F7FA] rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`bg-white rounded-xl border p-5 shadow-card ${kpi.featured ? 'ring-1' : ''}`}
          style={{ borderColor: kpi.borderColor }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bgColor }}>
              <Icon name={kpi.icon as 'HomeIcon'} size={20} style={{ color: kpi.color }} className="" />
            </div>
            {kpi.trendUp !== null && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${kpi.trendUp ? 'bg-[#F0FBF4] text-[#38A169]' : 'bg-red-50 text-red-500'}`}>
                <Icon name={kpi.trendUp ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={10} />
                {kpi.trendUp ? 'Sube' : 'Baja'}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-1">{kpi.label}</p>
          <p className="text-3xl font-bold font-tabular mb-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          <p className="text-xs text-[#718096]">{kpi.subValue}</p>
          <p className="text-xs text-[#A0AEC0] mt-2">{kpi.trend}</p>
        </div>
      ))}
    </div>
  );
}