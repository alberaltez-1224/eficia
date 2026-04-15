'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import type { Category } from './SavingsCalculatorContent';

interface StepProvidersProps {
  category: Category | null;
  savingsMin: number;
  savingsMax: number;
  onBack: () => void;
}

interface Provider {
  id: string;
  company_name: string;
  description: string | null;
  service_zones: string | null;
  estimated_savings: string | null;
  status: string;
  is_featured: boolean;
  phone: string | null;
}

interface ContactFormData {
  message: string;
  phone: string;
}

export default function StepProviders({ category, savingsMin, savingsMax, onBack }: StepProvidersProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactingProvider, setContactingProvider] = useState<string | null>(null);
  const [sentLeads, setSentLeads] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      const supabase = createClient();

      try {
        if (category) {
          // Find the category in DB by slug
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', category.id)
            .single();

          if (catData) {
            // Get provider IDs linked to this category
            const { data: pcData } = await supabase
              .from('provider_categories')
              .select('provider_id')
              .eq('category_id', catData.id);

            const providerIds = (pcData || []).map((r: { provider_id: string }) => r.provider_id);

            if (providerIds.length > 0) {
              const { data: provData } = await supabase
                .from('providers')
                .select('id, company_name, description, service_zones, estimated_savings, status, is_featured, phone')
                .in('id', providerIds)
                .in('status', ['verificado', 'pendiente'])
                .order('is_featured', { ascending: false });

              setProviders(provData || []);
            } else {
              setProviders([]);
            }
          } else {
            setProviders([]);
          }
        } else {
          // No category selected — fetch all verified providers
          const { data: provData } = await supabase
            .from('providers')
            .select('id, company_name, description, service_zones, estimated_savings, status, is_featured, phone')
            .in('status', ['verificado', 'pendiente'])
            .order('is_featured', { ascending: false });

          setProviders(provData || []);
        }
      } catch {
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category]);

  const onContact = async (data: ContactFormData) => {
    if (!contactingProvider) return;
    setIsSending(true);
    setSendError(null);

    const supabase = createClient();

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSendError('Debes iniciar sesión para enviar una solicitud.');
        setIsSending(false);
        return;
      }

      // Get the user's company record
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError || !companyData) {
        setSendError('No se encontró tu empresa. Completa tu perfil de empresa antes de enviar solicitudes.');
        setIsSending(false);
        return;
      }

      // Resolve category_id from DB if category is available
      let categoryId: string | null = null;
      if (category) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category.id)
          .maybeSingle();
        categoryId = catData?.id ?? null;
      }

      // Insert lead into Supabase
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          company_id: companyData.id,
          provider_id: contactingProvider,
          category_id: categoryId,
          message: data.message,
          status: 'nuevo',
        });

      if (leadError) {
        console.error('Lead insert error:', leadError.message);
        setSendError('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
        setIsSending(false);
        return;
      }

      setSentLeads((prev) => [...prev, contactingProvider]);
      setContactingProvider(null);
      reset();
    } catch (err: any) {
      console.error('Unexpected error:', err?.message);
      setSendError('Error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
          {loading ? (
            <span className="inline-block w-48 h-7 bg-[#E2E8F0] rounded animate-pulse" />
          ) : (
            <>
              {providers.length} proveedores disponibles
              {category && <span className="text-[#718096] font-normal"> · {category.name}</span>}
            </>
          )}
        </h2>
        <p className="text-[#718096]">
          Tu ahorro potencial:{' '}
          <strong className="text-[#38A169]">
            €{savingsMin.toLocaleString('es-ES')} – €{savingsMax.toLocaleString('es-ES')}
          </strong>
          /año
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E2E8F0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[#E2E8F0] rounded w-40" />
                  <div className="h-4 bg-[#E2E8F0] rounded w-full" />
                  <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F7FA] flex items-center justify-center mx-auto mb-4">
            <Icon name="BuildingStorefrontIcon" size={32} className="text-[#CBD5E0]" />
          </div>
          <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
            Aún no hay proveedores disponibles
          </h3>
          <p className="text-sm text-[#718096] max-w-sm mx-auto">
            Todavía no tenemos proveedores verificados para esta categoría. Vuelve pronto o contacta con nosotros para más información.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => {
            const isSent = sentLeads.includes(provider.id);
            const isContacting = contactingProvider === provider.id;

            return (
              <div
                key={provider.id}
                className={`bg-white rounded-xl border shadow-card overflow-hidden transition-all duration-200 ${
                  provider.is_featured ? 'border-[#38A169] ring-1 ring-[#38A169]/20' : 'border-[#E2E8F0]'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: category?.bgColor || '#F5F7FA' }}
                      >
                        <Icon name="BuildingStorefrontIcon" size={22} style={{ color: category?.color || '#718096' }} className="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold text-[#2D3748]">{provider.company_name}</h3>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#38A169] bg-[#F0FBF4] px-2 py-0.5 rounded-full">
                            <Icon name="CheckBadgeIcon" size={12} />
                            Verificado
                          </span>
                          {provider.is_featured && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
                              <Icon name="StarIcon" size={11} />
                              Destacado
                            </span>
                          )}
                        </div>
                        {provider.description && (
                          <p className="text-sm text-[#718096] leading-relaxed">{provider.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {provider.estimated_savings && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="bg-[#F0FBF4] rounded-lg p-3">
                        <p className="text-xs text-[#718096] mb-0.5">Ahorro estimado</p>
                        <p className="text-sm font-bold text-[#38A169]">{provider.estimated_savings}</p>
                      </div>
                      {provider.service_zones && (
                        <div className="bg-[#F5F7FA] rounded-lg p-3">
                          <p className="text-xs text-[#718096] mb-0.5">Zonas de servicio</p>
                          <p className="text-sm font-bold text-[#2D3748]">{provider.service_zones}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    {provider.service_zones && !provider.estimated_savings ? (
                      <div className="flex items-center gap-1 text-xs text-[#718096]">
                        <Icon name="MapPinIcon" size={12} />
                        <span>{provider.service_zones}</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    {isSent ? (
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#38A169] bg-[#F0FBF4] px-4 py-2 rounded-lg">
                        <Icon name="CheckCircleIcon" size={16} />
                        Solicitud enviada
                      </span>
                    ) : (
                      <button
                        onClick={() => setContactingProvider(isContacting ? null : provider.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95"
                      >
                        <Icon name="EnvelopeIcon" size={15} />
                        Solicitar información
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact form */}
                {isContacting && !isSent && (
                  <div className="border-t border-[#E2E8F0] bg-[#F5F7FA] p-6 animate-slide-up">
                    <h4 className="text-sm font-semibold text-[#2D3748] mb-4">
                      Enviar solicitud a {provider.company_name}
                    </h4>
                    <form onSubmit={handleSubmit(onContact)} className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor={`msg-${provider.id}`}>
                          Mensaje <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          id={`msg-${provider.id}`}
                          rows={3}
                          placeholder={`Hola, me interesa vuestra solución para ${category?.name || 'esta área'}. Somos una empresa de X empleados y actualmente gastamos €X al año en este concepto...`}
                          className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all resize-none ${errors.message ? 'border-red-400' : 'border-[#E2E8F0]'}`}
                          {...register('message', { required: 'El mensaje es obligatorio', minLength: { value: 20, message: 'Mínimo 20 caracteres' } })}
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor={`phone-${provider.id}`}>
                          Teléfono de contacto
                        </label>
                        <input
                          id={`phone-${provider.id}`}
                          type="tel"
                          placeholder="+34 91 234 56 78"
                          className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
                          {...register('phone')}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setContactingProvider(null); setSendError(null); }}
                          className="flex-1 py-2.5 border border-[#E2E8F0] text-sm font-semibold text-[#718096] rounded-lg hover:bg-white transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSending}
                          className="flex-1 py-2.5 bg-[#38A169] text-white text-sm font-semibold rounded-lg hover:bg-[#2D8055] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {isSending ? (
                            <><Icon name="ArrowPathIcon" size={14} className="animate-spin" />Enviando...</>
                          ) : (
                            'Enviar solicitud'
                          )}
                        </button>
                      </div>
                      {sendError && (
                        <p className="text-xs text-red-500 mt-1">{sendError}</p>
                      )}
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-semibold text-[#718096] rounded-lg hover:bg-[#F5F7FA] transition-all duration-150"
        >
          <Icon name="ChevronLeftIcon" size={16} />
          Ver mi ahorro
        </button>
        {sentLeads.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-[#38A169]">
            <Icon name="CheckCircleIcon" size={18} />
            {sentLeads.length} solicitud{sentLeads.length > 1 ? 'es' : ''} enviada{sentLeads.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}