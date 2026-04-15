'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ProviderFormData {
  companyName: string;
  cif: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  serviceZones: string;
  clientType: string;
  estimatedSavings: string;
  password: string;
  acceptTerms: boolean;
}

const categoryOptions = [
  { id: 'pcat-informatica', label: 'Informática', icon: '💻' },
  { id: 'pcat-bienestar', label: 'Bienestar', icon: '❤️' },
  { id: 'pcat-mobiliario', label: 'Mobiliario', icon: '🪑' },
  { id: 'pcat-energia', label: 'Energía', icon: '⚡' },
  { id: 'pcat-limpieza', label: 'Limpieza', icon: '✨' },
  { id: 'pcat-telecomunicaciones', label: 'Telecomunicaciones', icon: '📱' },
  { id: 'pcat-logistica', label: 'Logística', icon: '🚛' },
];

const clientTypes = ['Micropymes (1-10)', 'Pymes (11-100)', 'Medianas (101-500)', 'Grandes empresas (500+)', 'Todos los tamaños'];
const savingsRanges = ['10% – 20%', '20% – 35%', '30% – 50%', '40% – 60%', 'Más del 60%'];

export default function RegisterProviderForm({ onLogin }: { onLogin?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormData>();

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: ProviderFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signUp(data.email, data.password, {
        fullName: data.contactName,
        role: 'proveedor',
      });

      const supabase = createClient();
      const user = result?.user;
      if (user) {
        const { data: providerRecord } = await supabase.from('providers').insert({
          user_id: user.id,
          company_name: data.companyName,
          cif: data.cif,
          contact_name: data.contactName,
          phone: data.phone,
          website: data.website || null,
          description: data.description,
          service_zones: data.serviceZones,
          client_type: data.clientType,
          estimated_savings: data.estimatedSavings,
          status: 'pendiente',
        }).select('id').single();

        // Link categories
        if (providerRecord && selectedCategories.length > 0) {
          const { data: cats } = await supabase
            .from('categories')
            .select('id, slug')
            .in('slug', selectedCategories.map(c => c.replace('pcat-', '')));

          if (cats && cats.length > 0) {
            await supabase.from('provider_categories').insert(
              cats.map(cat => ({ provider_id: providerRecord.id, category_id: cat.id }))
            );
          }
        }
      }

      router.push('/provider-panel');
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes('already registered') || error.message?.toLowerCase().includes('already')) {
        setAuthError('Este email ya está registrado. Intenta iniciar sesión.');
      } else {
        setAuthError(error.message || 'Error al crear la cuenta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">Registra tu empresa</h1>
        <p className="text-sm text-[#718096]">Accede a empresas que buscan activamente tus servicios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Company + CIF */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-company">
              Empresa <span className="text-red-400">*</span>
            </label>
            <input
              id="rp-company"
              type="text"
              placeholder="Vasyco S.L."
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.companyName ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('companyName', { required: 'Obligatorio' })}
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-cif">
              CIF <span className="text-red-400">*</span>
            </label>
            <input
              id="rp-cif"
              type="text"
              placeholder="B87654321"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-mono ${errors.cif ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('cif', { required: 'Obligatorio' })}
            />
            {errors.cif && <p className="mt-1 text-xs text-red-500">{errors.cif.message}</p>}
          </div>
        </div>

        {/* Contact + Email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-contact">
              Contacto <span className="text-red-400">*</span>
            </label>
            <input
              id="rp-contact"
              type="text"
              placeholder="Carlos Ruiz"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.contactName ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('contactName', { required: 'Obligatorio' })}
            />
            {errors.contactName && <p className="mt-1 text-xs text-red-500">{errors.contactName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-email">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="rp-email"
              type="email"
              placeholder="hola@empresa.es"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.email ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('email', { required: 'Obligatorio', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        {/* Phone + Website */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-phone">
              Teléfono <span className="text-red-400">*</span>
            </label>
            <input
              id="rp-phone"
              type="tel"
              placeholder="+34 91 234 56 78"
              className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
              {...register('phone', { required: 'Obligatorio' })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-web">
              Web corporativa
            </label>
            <input
              id="rp-web"
              type="url"
              placeholder="https://empresa.es"
              className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
              {...register('website')}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-desc">
            Descripción de la empresa <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-[#718096] mb-1.5">Explica qué servicios ofreces y cómo ayudas a ahorrar</p>
          <textarea
            id="rp-desc"
            rows={3}
            placeholder="Somos especialistas en equipos informáticos reacondicionados certificados..."
            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all resize-none ${errors.description ? 'border-red-400' : 'border-[#E2E8F0]'}`}
            {...register('description', { required: 'Descripción obligatoria', minLength: { value: 50, message: 'Mínimo 50 caracteres' } })}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5">
            Categorías de servicio <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-[#718096] mb-2">Selecciona todas las áreas donde ofreces ahorro</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-[#718096] border-[#E2E8F0] hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zones + Client type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-zones">
              Zonas de servicio <span className="text-red-400">*</span>
            </label>
            <input
              id="rp-zones"
              type="text"
              placeholder="Madrid, Barcelona, Nacional"
              className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
              {...register('serviceZones', { required: 'Obligatorio' })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-clienttype">
              Tipo de cliente objetivo <span className="text-red-400">*</span>
            </label>
            <select
              id="rp-clienttype"
              className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
              {...register('clientType', { required: 'Obligatorio' })}
            >
              <option value="">Seleccionar</option>
              {clientTypes.map((t) => (
                <option key={`ct-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated savings */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-savings">
            Ahorro estimado para el cliente <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-[#718096] mb-1.5">Rango de ahorro que habitualmente consigues para tus clientes</p>
          <select
            id="rp-savings"
            className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
            {...register('estimatedSavings', { required: 'Obligatorio' })}
          >
            <option value="">Seleccionar rango</option>
            {savingsRanges.map((r) => (
              <option key={`sr-${r}`} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rp-password">
            Contraseña <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="rp-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
              {...register('password', { required: 'Obligatorio', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0]" {...register('acceptTerms', { required: 'Debes aceptar los términos' })} />
            <span className="text-xs text-[#718096]">
              Acepto los <a href="#" className="text-[#1E3A5F] font-medium hover:underline">Términos de uso</a> y la <a href="#" className="text-[#1E3A5F] font-medium hover:underline">Política de privacidad</a>. Entiendo que mi perfil será revisado antes de aparecer en el marketplace.
            </span>
          </label>
          {errors.acceptTerms && <p className="mt-1 text-xs text-red-500">{errors.acceptTerms.message}</p>}
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#38A169] text-white font-semibold text-sm rounded-lg hover:bg-[#2D8055] transition-all duration-150 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Icon name="ArrowPathIcon" size={18} className="animate-spin" />Enviando solicitud...</>
          ) : (
            'Solicitar acceso como proveedor'
          )}
        </button>
      </form>

      <p className="text-sm text-center text-[#718096] mt-6">
        ¿Ya tienes cuenta?{' '}
        {onLogin ? (
          <button type="button" onClick={onLogin} className="font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors">
            Iniciar sesión
          </button>
        ) : (
          <a href="/sign-up-login-screen" className="font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors">
            Iniciar sesión
          </a>
        )}
      </p>
    </div>
  );
}