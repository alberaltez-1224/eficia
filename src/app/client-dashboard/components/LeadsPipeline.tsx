'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Lead {
  id: string;
  provider: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  message: string;
  date: string;
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'nuevo': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  'en_proceso': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'respondido': { bg: 'bg-[#F0FBF4]', text: 'text-[#38A169]', dot: 'bg-[#38A169]' },
  'cerrado': { bg: 'bg-[#F5F7FA]', text: 'text-[#718096]', dot: 'bg-[#CBD5E0]' },
};

const statusLabels: Record<string, string> = {
  nuevo: 'Sin respuesta',
  en_proceso: 'En negociación',
  respondido: 'Respondido',
  cerrado: 'Cerrado',
};

interface LeadsPipelineProps {
  compact?: boolean;
}

export default function LeadsPipeline({ compact = false }: LeadsPipelineProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchLeads = async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) { setLoading(false); return; }

      const { data } = await supabase
        .from('leads')
        .select('id, message, status, created_at, providers(company_name), categories(name)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (data) {
        setLeads(data.map((row: any) => ({
          id: row.id,
          provider: row.providers?.company_name || 'Proveedor',
          category: row.categories?.name || 'General',
          categoryColor: '#3B82F6',
          categoryBg: '#EFF6FF',
          message: row.message || '',
          date: new Date(row.created_at).toLocaleDateString('es-ES'),
          status: row.status || 'nuevo',
        })));
      }
      setLoading(false);
    };

    fetchLeads();
  }, [user]);

  const displayLeads = compact ? leads.slice(0, 3) : leads;
  const filtered = statusFilter === 'Todos' ? displayLeads : displayLeads.filter((l) => l.status === statusFilter);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#2D3748]">Mis solicitudes</h3>
            <p className="text-xs text-[#718096] mt-0.5">{leads.length} solicitudes enviadas</p>
          </div>
        </div>
        {!compact && (
          <div className="flex gap-1.5 flex-wrap">
            {['Todos', 'nuevo', 'en_proceso', 'respondido', 'cerrado'].map((s) => (
              <button
                key={`filter-${s}`}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${statusFilter === s ? 'bg-[#1E3A5F] text-white' : 'bg-[#F5F7FA] text-[#718096] hover:text-[#2D3748]'}`}
              >
                {s === 'Todos' ? 'Todos' : statusLabels[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-[#F5F7FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="EnvelopeIcon" size={24} className="text-[#CBD5E0]" />
          </div>
          <p className="text-sm font-semibold text-[#2D3748] mb-1">Sin solicitudes todavía</p>
          <p className="text-xs text-[#718096]">Tus solicitudes a proveedores aparecerán aquí</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F4F8]">
          {filtered.map((lead) => {
            const sc = statusConfig[lead.status] || statusConfig['cerrado'];
            return (
              <div key={lead.id} className="px-6 py-4 hover:bg-[#F5F7FA] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: lead.categoryBg }}>
                    <Icon name="BuildingStorefrontIcon" size={14} style={{ color: lead.categoryColor }} className="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-[#2D3748] truncate">{lead.provider}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: lead.categoryBg, color: lead.categoryColor }}>
                          {lead.category}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {statusLabels[lead.status] || lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#718096] truncate mb-1">{lead.message}</p>
                    <p className="text-xs text-[#A0AEC0] font-tabular">{lead.date}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {compact && leads.length > 0 && (
        <div className="px-6 py-3 border-t border-[#E2E8F0]">
          <button className="text-xs font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors flex items-center gap-1">
            Ver todas las solicitudes
            <Icon name="ArrowRightIcon" size={12} />
          </button>
        </div>
      )}
    </div>
  );
}