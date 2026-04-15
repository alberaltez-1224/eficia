'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ProfileFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  serviceZones: string;
  estimatedSavings: string;
  clientType: string;
}

export default function ProviderProfileEditor() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      serviceZones: '',
      estimatedSavings: '',
      clientType: 'Todos los tamaños',
    },
  });

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const loadProfile = async () => {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, company_name, contact_name, phone, website, description, service_zones, estimated_savings, client_type')
        .eq('user_id', user.id)
        .single();

      if (provider) {
        setProviderId(provider.id);
        reset({
          companyName: provider.company_name || '',
          contactName: provider.contact_name || '',
          email: user.email || '',
          phone: provider.phone || '',
          website: provider.website || '',
          description: provider.description || '',
          serviceZones: provider.service_zones || '',
          estimatedSavings: provider.estimated_savings || '',
          clientType: provider.client_type || 'Todos los tamaños',
        });
      }
      setLoadingProfile(false);
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!providerId) return;
    setIsSaving(true);
    setSavedOk(false);
    const supabase = createClient();
    await supabase.from('providers').update({
      company_name: data.companyName,
      contact_name: data.contactName,
      phone: data.phone,
      website: data.website,
      description: data.description,
      service_zones: data.serviceZones,
      estimated_savings: data.estimatedSavings,
      client_type: data.clientType,
    }).eq('id', providerId);
    setIsSaving(false);
    setSavedOk(true);
    reset(data);
  };

  if (loadingProfile) {
    return (
      <div className="max-w-3xl bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {isDirty && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700">
          <Icon name="ExclamationCircleIcon" size={16} className="text-amber-500 shrink-0" />
          Tienes cambios sin guardar
        </div>
      )}

      {savedOk && !isDirty && (
        <div className="mb-4 bg-[#F0FBF4] border border-[#A3EBC2] rounded-xl p-3 flex items-center gap-2 text-sm text-[#38A169]">
          <Icon name="CheckCircleIcon" size={16} />
          Perfil guardado correctamente
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Public profile preview */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 mb-6">
          <h3 className="text-base font-semibold text-[#2D3748] mb-5 flex items-center gap-2">
            <Icon name="BuildingStorefrontIcon" size={18} className="text-[#1E3A5F]" />
            Ficha pública
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-company">
                Nombre de empresa
              </label>
              <input
                id="pe-company"
                type="text"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('companyName', { required: 'Obligatorio' })}
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-contact">
                Persona de contacto
              </label>
              <input
                id="pe-contact"
                type="text"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('contactName')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-email">
                Email
              </label>
              <input
                id="pe-email"
                type="email"
                disabled
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-[#F5F7FA] text-[#718096] cursor-not-allowed"
                {...register('email')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-phone">
                Teléfono
              </label>
              <input
                id="pe-phone"
                type="tel"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('phone')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-web">
                Web corporativa
              </label>
              <input
                id="pe-web"
                type="url"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('website')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-desc">
                Descripción de la empresa
              </label>
              <p className="text-xs text-[#718096] mb-1.5">Esta descripción aparece en tu ficha pública del marketplace</p>
              <textarea
                id="pe-desc"
                rows={4}
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all resize-none"
                {...register('description')}
              />
            </div>
          </div>
        </div>

        {/* Service details */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 mb-6">
          <h3 className="text-base font-semibold text-[#2D3748] mb-5 flex items-center gap-2">
            <Icon name="Cog6ToothIcon" size={18} className="text-[#1E3A5F]" />
            Detalles del servicio
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-zones">
                Zonas de servicio
              </label>
              <input
                id="pe-zones"
                type="text"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('serviceZones')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-savings">
                Ahorro estimado para clientes
              </label>
              <input
                id="pe-savings"
                type="text"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('estimatedSavings')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="pe-clienttype">
                Tipo de cliente objetivo
              </label>
              <select
                id="pe-clienttype"
                className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                {...register('clientType')}
              >
                {['Micropymes (1-10)', 'Pymes (11-100)', 'Medianas (101-500)', 'Grandes empresas (500+)', 'Todos los tamaños'].map((t) => (
                  <option key={`pe-ct-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save bar */}
        <div className="sticky bottom-4 bg-white border border-[#E2E8F0] rounded-xl shadow-modal p-4 flex items-center justify-between">
          <p className="text-sm text-[#718096]">
            {isDirty ? 'Cambios sin guardar' : savedOk ? 'Guardado correctamente' : 'Sin cambios pendientes'}
          </p>
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Guardando...</>
            ) : (
              <><Icon name="CheckIcon" size={16} />Guardar cambios</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}