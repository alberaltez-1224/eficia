'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import LoginForm from './LoginForm';
import RegisterClientForm from './RegisterClientForm';
import RegisterProviderForm from './RegisterProviderForm';

type View = 'login' | 'register-select' | 'register-client' | 'register-provider';

export default function AuthContainer() {
  const [view, setView] = useState<View>('login');

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#1E3A5F] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#38A169]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#2C5282]/50 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative">
          <Link href="/home-page" className="flex items-center gap-3">
            <AppLogo src="/assets/images/image-1776247061826.png" size={40} />
            <span className="text-2xl font-bold text-white">Eficia</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative">
          <div className="mb-8">
            <div className="w-16 h-16 bg-[#38A169]/20 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="ChartBarIcon" size={32} className="text-[#68D391]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Descubre cuánto puede ahorrar tu empresa
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Calcula tu ahorro en segundos y conecta con proveedores verificados.
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/15">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5]?.map((s) => (
                <Icon key={`star-${s}`} name="StarIcon" size={14} className="text-[#F59E0B]" />
              ))}
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              "Eficia nos ayudó a identificar un ahorro de 12.000€ anuales en telecomunicaciones. El proceso fue muy sencillo."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#38A169] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">MG</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">María González</p>
                <p className="text-white/50 text-xs">CFO · Distribuciones Ibersa S.L.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Empresas' },
            { value: '120+', label: 'Proveedores' },
            { value: '€2.4M', label: 'Ahorros' },
          ]?.map((stat) => (
            <div key={`auth-stat-${stat?.label}`} className="text-center">
              <p className="text-xl font-bold text-white font-tabular">{stat?.value}</p>
              <p className="text-xs text-white/50">{stat?.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/home-page" className="flex items-center gap-2">
            <AppLogo src="/assets/images/image-1776247061826.png" size={36} />
            <span className="text-xl font-bold text-[#1E3A5F]">Eficia</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <>
              <LoginForm onRegister={() => setView('register-select')} />
              {/* Admin access info removed */}
            </>
          )}

          {/* REGISTER TYPE SELECTOR */}
          {view === 'register-select' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">Crear cuenta</h1>
                <p className="text-sm text-[#718096]">¿Cómo quieres usar Eficia?</p>
              </div>

              <div className="space-y-4">
                {/* Empresa cliente */}
                <button
                  type="button"
                  onClick={() => setView('register-client')}
                  className="w-full text-left p-5 bg-white border-2 border-[#E2E8F0] rounded-xl hover:border-[#1E3A5F] hover:shadow-md transition-all duration-150 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#EEF2F8] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#1E3A5F]/10 transition-colors">
                      <Icon name="BuildingOfficeIcon" size={24} className="text-[#1E3A5F]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1E3A5F] mb-1">Empresa cliente</p>
                      <p className="text-xs text-[#718096] leading-relaxed">
                        Quiero descubrir cuánto puede ahorrar mi empresa y conectar con proveedores verificados.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#38A169]">
                        <Icon name="CheckCircleIcon" size={14} />
                        Gratis · Sin compromiso
                      </div>
                    </div>
                    <Icon name="ChevronRightIcon" size={18} className="text-[#CBD5E0] group-hover:text-[#1E3A5F] transition-colors shrink-0 mt-1" />
                  </div>
                </button>

                {/* Empresa proveedora */}
                <button
                  type="button"
                  onClick={() => setView('register-provider')}
                  className="w-full text-left p-5 bg-white border-2 border-[#E2E8F0] rounded-xl hover:border-[#38A169] hover:shadow-md transition-all duration-150 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0FFF4] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#38A169]/10 transition-colors">
                      <Icon name="BriefcaseIcon" size={24} className="text-[#38A169]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1E3A5F] mb-1">Empresa proveedora</p>
                      <p className="text-xs text-[#718096] leading-relaxed">
                        Ofrezco soluciones de ahorro y quiero acceder a empresas que buscan activamente mis servicios.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#38A169]">
                        <Icon name="CheckCircleIcon" size={14} />
                        Accede a clientes cualificados
                      </div>
                    </div>
                    <Icon name="ChevronRightIcon" size={18} className="text-[#CBD5E0] group-hover:text-[#38A169] transition-colors shrink-0 mt-1" />
                  </div>
                </button>
              </div>

              <p className="text-sm text-center text-[#718096] mt-6">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="font-semibold text-[#1E3A5F] hover:text-[#38A169] transition-colors"
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          )}

          {/* REGISTER CLIENT FORM */}
          {view === 'register-client' && (
            <div>
              <button
                type="button"
                onClick={() => setView('register-select')}
                className="flex items-center gap-1.5 text-sm text-[#718096] hover:text-[#1E3A5F] transition-colors mb-6"
              >
                <Icon name="ArrowLeftIcon" size={16} />
                Volver
              </button>
              <RegisterClientForm onLogin={() => setView('login')} />
            </div>
          )}

          {/* REGISTER PROVIDER FORM */}
          {view === 'register-provider' && (
            <div>
              <button
                type="button"
                onClick={() => setView('register-select')}
                className="flex items-center gap-1.5 text-sm text-[#718096] hover:text-[#1E3A5F] transition-colors mb-6"
              >
                <Icon name="ArrowLeftIcon" size={16} />
                Volver
              </button>
              <RegisterProviderForm onLogin={() => setView('login')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}