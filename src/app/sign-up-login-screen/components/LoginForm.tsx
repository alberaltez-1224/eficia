'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm({ onRegister }: { onRegister?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signIn(data.email, data.password);
      // Use user from signIn result directly — avoids an extra getUser() API call
      const user = result?.user;
      if (user) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        const role = profile?.role || 'cliente';
        if (role === 'admin') {
          router.push('/admin-panel');
        } else if (role === 'proveedor') {
          router.push('/provider-panel');
        } else {
          router.push('/client-dashboard');
        }
        router.refresh();
      }
    } catch (error: any) {
      setAuthError(error.message === 'Invalid login credentials' ?'Email o contraseña incorrectos' : error.message ||'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">Bienvenido de nuevo</h1>
        <p className="text-sm text-[#718096]">Accede a tu panel de ahorro empresarial</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="login-email">
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="empresa@dominio.es"
            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${
              errors.email ? 'border-red-400' : 'border-[#E2E8F0]'
            }`}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Introduce un correo válido',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={12} />
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="login-password">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 pr-12 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all ${
                errors.password ? 'border-red-400' : 'border-[#E2E8F0]'
              }`}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#2D3748] transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={12} />
              {errors.password.message}
            </p>
          )}
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#1E3A5F] focus:ring-[#1E3A5F]/30"
              {...register('remember')}
            />
            <span className="text-sm text-[#718096]">Recordarme</span>
          </label>
          <a href="#" className="text-sm font-medium text-[#1E3A5F] hover:text-[#38A169] transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#1E3A5F] text-white font-semibold text-sm rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <p className="text-sm text-center text-[#718096] mt-6">
        ¿No tienes cuenta?{' '}
        {onRegister ? (
          <button
            type="button"
            onClick={onRegister}
            className="font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors"
          >
            Regístrate gratis
          </button>
        ) : (
          <Link href="/sign-up-login-screen" className="font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors">
            Regístrate gratis
          </Link>
        )}
      </p>
    </div>
  );
}