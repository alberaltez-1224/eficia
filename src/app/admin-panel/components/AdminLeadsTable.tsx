'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Lead {
  id: string;
  clientName: string;
  providerName: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  message: string;
  date: string;
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  'nuevo': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'en_proceso': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'respondido': { bg: 'bg-purple-50', text: 'text-purple-600' },
  'cerrado': { bg: 'bg-[#F0FBF4]', text: 'text-[#38A169]' },
};

const statusLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  en_proceso: 'En proceso',
  respondido: 'Respondido',
  cerrado: 'Cerrado',
};

interface AdminLeadsTableProps {
  compact?: boolean;
}

export default function AdminLeadsTable({ compact = false }: AdminLeadsTableProps) {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    const supabase = createClient();

    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select('id, message, status, created_at, companies(company_name), providers(company_name), categories(name)')
        .order('created_at', { ascending: false });

      if (data) {
        setAllLeads(data.map((row: any) => ({
          id: row.id,
          clientName: row.companies?.company_name || 'Cliente',
          providerName: row.providers?.company_name || 'Proveedor',
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
  }, []);

  const displayLeads = compact ? allLeads.slice(0, 5) : allLeads;
  const filtered = displayLeads.filter((l) => {
    const matchesStatus = filterStatus === 'Todos' || l.status === filterStatus;
    const matchesSearch =
      l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            <h3 className="text-base font-semibold text-[#2D3748]">Todos los leads</h3>
            <p className="text-xs text-[#718096] mt-0.5">{allLeads.length} leads en la plataforma</p>
          </div>
        </div>
        {!compact && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
              <input
                type="text"
                placeholder="Buscar cliente o proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#718096] bg-white focus:outline-none"
            >
              {['Todos', 'nuevo', 'en_proceso', 'respondido', 'cerrado'].map((s) => (
                <option key={`alead-status-${s}`} value={s}>{s === 'Todos' ? 'Todos' : statusLabels[s]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {allLeads.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-[#F5F7FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="EnvelopeIcon" size={24} className="text-[#CBD5E0]" />
          </div>
          <p className="text-sm font-semibold text-[#2D3748] mb-1">Sin leads todavía</p>
          <p className="text-xs text-[#718096]">Los leads aparecerán aquí cuando los clientes envíen solicitudes</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Empresa cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, idx) => {
                const sc = statusConfig[lead.status] || statusConfig['nuevo'];
                return (
                  <tr key={lead.id} className={`border-b border-[#F0F4F8] hover:bg-[#F5F7FA] transition-colors ${idx % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}>
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-semibold text-[#2D3748]">{lead.clientName}</p>
                      <p className="text-xs text-[#718096] truncate max-w-[160px]">{lead.message}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-[#2D3748]">{lead.providerName}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: lead.categoryBg, color: lead.categoryColor }}>
                        {lead.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#718096] font-tabular">{lead.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        {statusLabels[lead.status] || lead.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-6 py-4 border-t border-[#E2E8F0]">
        <p className="text-xs text-[#718096]">Mostrando {filtered.length} de {allLeads.length} leads</p>
      </div>
    </div>
  );
}