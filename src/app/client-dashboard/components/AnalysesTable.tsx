'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Analysis {
  id: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  categoryBg: string;
  date: string;
  annualSpend: string;
  savingsMin: number;
  savingsMax: number;
  providers: number;
  status: string;
}

const categoryMeta: Record<string, { icon: string; color: string; bg: string }> = {
  informatica: { icon: 'ComputerDesktopIcon', color: '#3B82F6', bg: '#EFF6FF' },
  energia: { icon: 'BoltIcon', color: '#F97316', bg: '#FFF7ED' },
  telecomunicaciones: { icon: 'PhoneIcon', color: '#8B5CF6', bg: '#F5F3FF' },
  bienestar: { icon: 'HeartIcon', color: '#EC4899', bg: '#FDF2F8' },
  limpieza: { icon: 'SparklesIcon', color: '#06B6D4', bg: '#ECFEFF' },
  mobiliario: { icon: 'HomeIcon', color: '#F59E0B', bg: '#FFFBEB' },
  logistica: { icon: 'TruckIcon', color: '#38A169', bg: '#F0FBF4' },
};

interface AnalysesTableProps {
  compact?: boolean;
}

export default function AnalysesTable({ compact = false }: AnalysesTableProps) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchAnalyses = async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) { setLoading(false); return; }

      const { data } = await supabase
        .from('savings')
        .select('id, created_at, annual_spend, savings_min, savings_max, categories(name, slug)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (data) {
        setAnalyses(data.map((row: any) => {
          const slug = row.categories?.slug || 'informatica';
          const meta = categoryMeta[slug] || categoryMeta['informatica'];
          return {
            id: row.id,
            category: row.categories?.name || slug,
            categoryIcon: meta.icon,
            categoryColor: meta.color,
            categoryBg: meta.bg,
            date: new Date(row.created_at).toLocaleDateString('es-ES'),
            annualSpend: `€${(row.annual_spend || 0).toLocaleString('es-ES')}`,
            savingsMin: row.savings_min || 0,
            savingsMax: row.savings_max || 0,
            providers: 0,
            status: 'Activo',
          };
        }));
      }
      setLoading(false);
    };

    fetchAnalyses();
  }, [user]);

  const displayData = compact ? analyses.slice(0, 3) : analyses;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#2D3748]">Análisis realizados</h3>
          <p className="text-xs text-[#718096] mt-0.5">{analyses.length} análisis en total</p>
        </div>
        <Link href="/savings-calculator" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors">
          <Icon name="PlusIcon" size={14} />
          Nuevo análisis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-[#F5F7FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="DocumentChartBarIcon" size={24} className="text-[#CBD5E0]" />
          </div>
          <p className="text-sm font-semibold text-[#2D3748] mb-1">Sin análisis todavía</p>
          <p className="text-xs text-[#718096] mb-4">Realiza tu primer análisis de ahorro</p>
          <Link href="/savings-calculator" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all">
            <Icon name="PlusIcon" size={14} />
            Iniciar análisis
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Gasto anual</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Ahorro estimado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, idx) => (
                <tr key={row.id} className={`border-b border-[#F0F4F8] hover:bg-[#F5F7FA] transition-colors ${idx % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: row.categoryBg }}>
                        <Icon name={row.categoryIcon as 'HomeIcon'} size={16} style={{ color: row.categoryColor }} className="" />
                      </div>
                      <span className="text-sm font-semibold text-[#2D3748]">{row.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#718096] font-tabular">{row.date}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#2D3748] font-tabular">{row.annualSpend}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-[#38A169] font-tabular">
                      €{row.savingsMin.toLocaleString('es-ES')} – €{row.savingsMax.toLocaleString('es-ES')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F0FBF4] text-[#38A169]">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/savings-calculator" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors">
                      Ver detalle
                      <Icon name="ArrowRightIcon" size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}