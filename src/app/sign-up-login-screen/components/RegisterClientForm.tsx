'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ClientFormData {
  companyName: string;
  cif: string;
  contactName: string;
  email: string;
  phone: string;
  employees: string;
  sector: string;
  location: string;
  password: string;
  acceptTerms: boolean;
}

const sectors = [
  'Tecnología', 'Retail / Comercio', 'Hostelería', 'Construcción',
  'Logística y transporte', 'Salud y farmacia', 'Educación',
  'Servicios profesionales', 'Industria / Manufactura', 'Otro',
];

const employeeRanges = ['1–10', '11–25', '26–50', '51–100', '101–250', '251–500', '500+'];

export default function RegisterClientForm({ onLogin }: { onLogin?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>();

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signUp(data.email, data.password, {
        fullName: data.contactName,
        role: 'cliente',
      });

      // Create company record using the user returned from signUp
      const supabase = createClient();
      const user = result?.user;
      if (user) {
        await supabase.from('companies').insert({
          user_id: user.id,
          company_name: data.companyName,
          cif: data.cif,
          contact_name: data.contactName,
          phone: data.phone,
          employees: data.employees,
          sector: data.sector,
          location: data.location,
        });
      }

      router.push('/client-dashboard');
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes('already registered') || error.message?.includes('already registered') || error.message?.toLowerCase().includes('already')) {
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
        <p className="text-sm text-[#718096]">Descubre cuánto puedes ahorrar en cada área</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Company name */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-companyname">
            Nombre de la empresa <span className="text-red-400">*</span>
          </label>
          <input
            id="rc-companyname"
            type="text"
            placeholder="Acme Corporation S.L."
            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.companyName ? 'border-red-400' : 'border-[#E2E8F0]'}`}
            {...register('companyName', { required: 'Nombre de empresa obligatorio' })}
          />
          {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
        </div>

        {/* CIF + Contact row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-cif">
              CIF <span className="text-red-400">*</span>
            </label>
            <input
              id="rc-cif"
              type="text"
              placeholder="B12345678"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-mono ${errors.cif ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('cif', {
                required: 'CIF obligatorio',
                pattern: { value: /^[A-Z]\d{8}$/, message: 'Formato: B12345678' },
              })}
            />
            {errors.cif && <p className="mt-1 text-xs text-red-500">{errors.cif.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-contact">
              Persona de contacto <span className="text-red-400">*</span>
            </label>
            <input
              id="rc-contact"
              type="text"
              placeholder="Ana Martínez"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.contactName ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('contactName', { required: 'Contacto obligatorio' })}
            />
            {errors.contactName && <p className="mt-1 text-xs text-red-500">{errors.contactName.message}</p>}
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-email">
              Email corporativo <span className="text-red-400">*</span>
            </label>
            <input
              id="rc-email"
              type="email"
              placeholder="ana@empresa.es"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.email ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('email', {
                required: 'Email obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-phone">
              Teléfono <span className="text-red-400">*</span>
            </label>
            <input
              id="rc-phone"
              type="tel"
              placeholder="+34 91 234 56 78"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.phone ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('phone', { required: 'Teléfono obligatorio' })}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Employees + Sector */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-employees">
              Nº de empleados <span className="text-red-400">*</span>
            </label>
            <select
              id="rc-employees"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.employees ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('employees', { required: 'Selecciona rango' })}
            >
              <option value="">Seleccionar</option>
              {employeeRanges.map((r) => (
                <option key={`emp-${r}`} value={r}>{r}</option>
              ))}
            </select>
            {errors.employees && <p className="mt-1 text-xs text-red-500">{errors.employees.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-sector">
              Sector <span className="text-red-400">*</span>
            </label>
            <select
              id="rc-sector"
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.sector ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('sector', { required: 'Selecciona sector' })}
            >
              <option value="">Seleccionar</option>
              {sectors.map((s) => (
                <option key={`sector-${s}`} value={s}>{s}</option>
              ))}
            </select>
            {errors.sector && <p className="mt-1 text-xs text-red-500">{errors.sector.message}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-location">
            Ubicación (ciudad / provincia) <span className="text-red-400">*</span>
          </label>
          <input
            id="rc-location"
            type="text"
            placeholder="Madrid"
            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.location ? 'border-red-400' : 'border-[#E2E8F0]'}`}
            {...register('location', { required: 'Ubicación obligatoria' })}
          />
          {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="rc-password">
            Contraseña <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-[#718096] mb-1.5">Mínimo 8 caracteres, una mayúscula y un número</p>
          <div className="relative">
            <input
              id="rc-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-3 pr-12 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${errors.password ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              {...register('password', {
                required: 'Contraseña obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#2D3748] transition-colors"
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Accept terms */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#1E3A5F]"
              {...register('acceptTerms', { required: 'Debes aceptar los términos' })}
            />
            <span className="text-xs text-[#718096]">
              Acepto los{' '}
              <a href="#" className="text-[#1E3A5F] font-medium hover:underline">Términos de uso</a>
              {' '}y la{' '}
              <a href="#" className="text-[#1E3A5F] font-medium hover:underline">Política de privacidad</a>
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
          className="w-full py-3 bg-[#1E3A5F] text-white font-semibold text-sm rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta gratuita'
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