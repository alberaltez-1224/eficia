'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Provider {
  id: string;
  company_name: string;
  description: string | null;
  service_zones: string | null;
  estimated_savings: string | null;
  status: string;
  is_featured: boolean;
}

export default function ProvidersSection() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('providers')
        .select('id, company_name, description, service_zones, estimated_savings, status, is_featured')
        .in('status', ['verificado', 'pendiente'])
        .order('is_featured', { ascending: false })
        .limit(6);
      setProviders(data || []);
      setLoading(false);
    };
    fetchProviders();
  }, []);

  return (
    <section id="proveedores" className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 gap-4">
          <div>
            <span className="inline-block text-xs font-semibold text-[#1E3A5F] uppercase tracking-widest mb-3 px-3 py-1 bg-[#EEF2F8] rounded-full">
              Marketplace
            </span>
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-3">
              Proveedores destacados
            </h2>
            <p className="text-lg text-[#718096]">
              Empresas verificadas con resultados demostrados.
            </p>
          </div>
          <Link
            href="/sign-up-login-screen"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors shrink-0"
          >
            Ver todos los proveedores
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#F5F7FA] rounded-2xl border border-[#E2E8F0] p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-[#E2E8F0] mb-4" />
                <div className="h-5 bg-[#E2E8F0] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#E2E8F0] rounded w-full mb-1" />
                <div className="h-4 bg-[#E2E8F0] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#F5F7FA] rounded-2xl border border-[#E2E8F0]">
            <div className="w-16 h-16 rounded-full bg-[#EEF2F8] flex items-center justify-center mb-4">
              <Icon name="BuildingOfficeIcon" size={32} className="text-[#718096]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D3748] mb-2">Aún no hay proveedores disponibles</h3>
            <p className="text-sm text-[#718096] max-w-sm">
              Pronto encontrarás aquí proveedores verificados para optimizar los costes de tu empresa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  provider.is_featured ? 'border-[#38A169] ring-1 ring-[#38A169]/20' : 'border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EEF2F8] flex items-center justify-center shrink-0">
                    <Icon name="BuildingStorefrontIcon" size={24} className="text-[#1E3A5F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold text-[#2D3748] truncate">{provider.company_name}</h3>
                      {provider.is_featured && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-full shrink-0">
                          <Icon name="StarIcon" size={11} />
                          Destacado
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      provider.status === 'verificado'
                        ? 'text-[#38A169] bg-[#F0FBF4]' :'text-[#D97706] bg-[#FFFBEB]'
                    }`}>
                      <Icon name={provider.status === 'verificado' ? 'CheckBadgeIcon' : 'ClockIcon'} size={12} />
                      {provider.status === 'verificado' ? 'Verificado' : 'Pendiente de verificación'}
                    </span>
                  </div>
                </div>

                {provider.description && (
                  <p className="text-sm text-[#718096] mb-3 line-clamp-2">{provider.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-[#718096]">
                  {provider.service_zones && (
                    <span className="flex items-center gap-1">
                      <Icon name="MapPinIcon" size={12} />
                      {provider.service_zones}
                    </span>
                  )}
                  {provider.estimated_savings && (
                    <span className="flex items-center gap-1 text-[#38A169] font-semibold">
                      <Icon name="ArrowTrendingDownIcon" size={12} />
                      Ahorro: {provider.estimated_savings}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Provider CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">¿Eres proveedor de soluciones empresariales?</h3>
            <p className="text-white/70">Únete a Eficia y accede a empresas que ya están buscando tus servicios activamente.</p>
          </div>
          <Link
            href="/sign-up-login-screen"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#38A169] text-white font-semibold rounded-xl hover:bg-[#2D8055] transition-all duration-150 active:scale-95"
          >
            <Icon name="PlusIcon" size={18} />
            Registrarme como proveedor
          </Link>
        </div>
      </div>
    </section>
  );
}