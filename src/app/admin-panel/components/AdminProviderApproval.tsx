'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Provider {
  id: string;
  name: string;
  cif: string;
  contact: string;
  email: string;
  phone: string;
  website: string;
  categories: string[];
  zones: string;
  clientType: string;
  estimatedSavings: string;
  registeredDate: string;
  status: string;
  description: string;
}

interface AdminProviderApprovalProps {
  compact?: boolean;
}

export default function AdminProviderApproval({ compact = false }: AdminProviderApprovalProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const supabase = createClient();

    const fetchPending = async () => {
      const { data } = await supabase
        .from('providers')
        .select('id, company_name, cif, contact_name, phone, website, description, service_zones, client_type, estimated_savings, status, created_at, user_profiles(email), provider_categories(categories(name))')
        .eq('status', 'pendiente')
        .order('created_at', { ascending: false });

      if (data) {
        setProviders(data.map((row: any) => ({
          id: row.id,
          name: row.company_name,
          cif: row.cif || '',
          contact: row.contact_name || '',
          email: row.user_profiles?.email || '',
          phone: row.phone || '',
          website: row.website || '',
          categories: row.provider_categories?.map((pc: any) => pc.categories?.name).filter(Boolean) || [],
          zones: row.service_zones || '',
          clientType: row.client_type || '',
          estimatedSavings: row.estimated_savings || '',
          registeredDate: new Date(row.created_at).toLocaleDateString('es-ES'),
          status: row.status,
          description: row.description || '',
        })));
      }
      setLoading(false);
    };

    fetchPending();
  }, []);

  const approveProvider = async (id: string) => {
    const supabase = createClient();
    await supabase.from('providers').update({ status: 'aprobado' }).eq('id', id);
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  const rejectProvider = async (id: string) => {
    const supabase = createClient();
    await supabase.from('providers').update({ status: 'rechazado' }).eq('id', id);
    setProviders((prev) => prev.filter((p) => p.id !== id));
    setRejectingId(null);
    setRejectReason('');
  };

  const displayProviders = compact ? providers.slice(0, 3) : providers;

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
          <h3 className="text-base font-semibold text-[#2D3748]">Proveedores pendientes de aprobación</h3>
          <p className="text-xs text-[#718096] mt-0.5">{providers.length} solicitudes en espera</p>
        </div>
        {providers.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Revisión requerida
          </span>
        )}
      </div>

      {providers.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-[#F0FBF4] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="CheckCircleIcon" size={24} className="text-[#38A169]" />
          </div>
          <p className="text-sm font-semibold text-[#2D3748] mb-1">Todas las solicitudes revisadas</p>
          <p className="text-xs text-[#718096]">No hay proveedores pendientes de aprobación</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F4F8]">
          {displayProviders.map((provider) => (
            <div key={provider.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-[#2D3748]">{provider.name}</h4>
                    <span className="text-xs font-mono text-[#718096] bg-[#F5F7FA] px-2 py-0.5 rounded">{provider.cif}</span>
                    {provider.categories.map((cat) => (
                      <span key={`cat-badge-${provider.id}-${cat}`} className="text-xs font-semibold bg-[#EEF2F8] text-[#1E3A5F] px-2 py-0.5 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#718096] mb-2">
                    {provider.contact} · {provider.email} · {provider.zones}
                  </p>

                  {expandedProvider === provider.id && (
                    <div className="mt-3 bg-[#F5F7FA] rounded-lg p-4 text-sm text-[#718096] mb-3">
                      <p className="mb-2">{provider.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div><span className="font-semibold text-[#2D3748]">Teléfono:</span> {provider.phone}</div>
                        {provider.website && <div><span className="font-semibold text-[#2D3748]">Web:</span> {provider.website}</div>}
                        <div><span className="font-semibold text-[#2D3748]">Ahorro:</span> {provider.estimatedSavings}</div>
                        <div><span className="font-semibold text-[#2D3748]">Cliente:</span> {provider.clientType}</div>
                        <div><span className="font-semibold text-[#2D3748]">Registrado:</span> {provider.registeredDate}</div>
                      </div>
                    </div>
                  )}

                  {rejectingId === provider.id && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-[#2D3748] mb-1.5" htmlFor={`reject-reason-${provider.id}`}>
                        Motivo del rechazo
                      </label>
                      <textarea
                        id={`reject-reason-${provider.id}`}
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ej: Documentación incompleta..."
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="text-xs font-semibold px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[#718096] hover:bg-[#F5F7FA] transition-all">
                          Cancelar
                        </button>
                        <button onClick={() => rejectProvider(provider.id)} className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                          Confirmar rechazo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)} title="Ver detalles" className="p-2 rounded-lg text-[#718096] hover:text-[#1E3A5F] hover:bg-[#EEF2F8] transition-all">
                    <Icon name="EyeIcon" size={16} />
                  </button>
                  <button onClick={() => setRejectingId(provider.id)} title="Rechazar" className="p-2 rounded-lg text-[#718096] hover:text-red-500 hover:bg-red-50 transition-all">
                    <Icon name="XMarkIcon" size={16} />
                  </button>
                  <button onClick={() => approveProvider(provider.id)} title="Aprobar" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#38A169] text-white text-xs font-semibold rounded-lg hover:bg-[#2D8055] transition-all active:scale-95">
                    <Icon name="CheckIcon" size={14} />
                    Aprobar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}