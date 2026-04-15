'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Lead {
  id: string;
  clientName: string;
  clientSector: string;
  employees: number;
  category: string;
  categoryColor: string;
  categoryBg: string;
  message: string;
  date: string;
  status: string;
  location: string;
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

const statusOptions = ['nuevo', 'en_proceso', 'respondido', 'cerrado'];

export default function ProviderLeadsTable() {
  const { user } = useAuth();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchLeads = async () => {
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!provider) { setLoading(false); return; }

      const { data } = await supabase
        .from('leads')
        .select('id, message, status, created_at, companies(company_name, sector, employees, location), categories(name)')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (data) {
        setLeadsData(data.map((row: any) => ({
          id: row.id,
          clientName: row.companies?.company_name || 'Cliente',
          clientSector: row.companies?.sector || '',
          employees: row.companies?.employees || 0,
          category: row.categories?.name || 'General',
          categoryColor: '#3B82F6',
          categoryBg: '#EFF6FF',
          message: row.message || '',
          date: new Date(row.created_at).toLocaleDateString('es-ES'),
          status: row.status || 'nuevo',
          location: row.companies?.location || '',
        })));
      }
      setLoading(false);
    };

    fetchLeads();
  }, [user]);

  const filtered = leadsData.filter((l) => {
    const matchesStatus = filterStatus === 'Todos' || l.status === filterStatus;
    const matchesSearch = l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateStatus = async (leadId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    setLeadsData((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
    setStatusDropdown(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#E2E8F0] flex flex-col gap-3">
        <div className="relative w-full">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Buscar empresa o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Todos', ...statusOptions].map((s) => (
            <button
              key={`lead-filter-${s}`}
              onClick={() => setFilterStatus(s)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${filterStatus === s ? 'bg-[#1E3A5F] text-white' : 'bg-[#F5F7FA] text-[#718096] hover:text-[#2D3748]'}`}
            >
              {s === 'Todos' ? 'Todos' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {leadsData.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-[#F5F7FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="EnvelopeIcon" size={24} className="text-[#CBD5E0]" />
          </div>
          <p className="text-sm font-semibold text-[#2D3748] mb-1">Sin leads todavía</p>
          <p className="text-xs text-[#718096]">Los leads de clientes aparecerán aquí</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-[#F0F4F8]">
            {filtered.map((lead) => {
              const sc = statusConfig[lead.status] || statusConfig['nuevo'];
              const isExpanded = expandedLead === lead.id;
              return (
                <div key={lead.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#2D3748] truncate">{lead.clientName}</p>
                      <p className="text-xs text-[#718096]">{lead.clientSector}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setStatusDropdown(statusDropdown === lead.id ? null : lead.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${sc.bg} ${sc.text} hover:opacity-80`}
                      >
                        {statusLabels[lead.status] || lead.status}
                        <Icon name="ChevronDownIcon" size={10} />
                      </button>
                      {statusDropdown === lead.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-dropdown z-20 min-w-[160px] py-1">
                          {statusOptions.map((opt) => (
                            <button
                              key={`status-opt-${opt}`}
                              onClick={() => updateStatus(lead.id, opt)}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#F5F7FA] transition-colors ${lead.status === opt ? 'text-[#1E3A5F]' : 'text-[#718096]'}`}
                            >
                              {statusLabels[opt]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: lead.categoryBg, color: lead.categoryColor }}>
                      {lead.category}
                    </span>
                    {lead.location && (
                      <span className="flex items-center gap-1 text-xs text-[#718096]">
                        <Icon name="MapPinIcon" size={11} />
                        {lead.location}
                      </span>
                    )}
                    <span className="text-xs text-[#A0AEC0]">{lead.date}</span>
                  </div>
                  {lead.message && (
                    <button
                      onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                      className="flex items-center gap-1 text-xs text-[#1E3A5F] font-semibold mt-1"
                    >
                      <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} />
                      {isExpanded ? 'Ocultar mensaje' : 'Ver mensaje'}
                    </button>
                  )}
                  {isExpanded && (
                    <div className="mt-2 p-3 bg-[#F5F7FA] rounded-lg">
                      <p className="text-xs font-semibold text-[#718096] mb-1">Mensaje del cliente:</p>
                      <p className="text-sm text-[#2D3748]">{lead.message}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F5F7FA]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Empresa cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Ubicación</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, idx) => {
                  const sc = statusConfig[lead.status] || statusConfig['nuevo'];
                  return (
                    <React.Fragment key={lead.id}>
                      <tr
                        className={`border-b border-[#F0F4F8] hover:bg-[#F5F7FA] transition-colors cursor-pointer ${idx % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}
                        onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#2D3748]">{lead.clientName}</p>
                          <p className="text-xs text-[#718096]">{lead.clientSector}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: lead.categoryBg, color: lead.categoryColor }}>
                            {lead.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-[#718096]">
                            <Icon name="MapPinIcon" size={12} />
                            {lead.location}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#718096] font-tabular">{lead.date}</td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={() => setStatusDropdown(statusDropdown === lead.id ? null : lead.id)}
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${sc.bg} ${sc.text} hover:opacity-80`}
                            >
                              {statusLabels[lead.status] || lead.status}
                              <Icon name="ChevronDownIcon" size={10} />
                            </button>
                            {statusDropdown === lead.id && (
                              <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-dropdown z-20 min-w-[160px] py-1">
                                {statusOptions.map((opt) => (
                                  <button
                                    key={`status-opt-${opt}`}
                                    onClick={() => updateStatus(lead.id, opt)}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#F5F7FA] transition-colors ${lead.status === opt ? 'text-[#1E3A5F]' : 'text-[#718096]'}`}
                                  >
                                    {statusLabels[opt]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Ver mensaje completo"
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1E3A5F] hover:bg-[#EEF2F8] transition-all"
                            onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                          >
                            <Icon name="EyeIcon" size={16} />
                          </button>
                        </td>
                      </tr>
                      {expandedLead === lead.id && (
                        <tr key={`${lead.id}-expanded`} className="bg-[#F5F7FA]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <Icon name="ChatBubbleLeftIcon" size={16} className="text-[#718096] mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-[#718096] mb-1">Mensaje del cliente:</p>
                                <p className="text-sm text-[#2D3748]">{lead.message}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}