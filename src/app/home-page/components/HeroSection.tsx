import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 savings-gradient" />
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Decorative orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#38A169]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#2C5282]/30 rounded-full blur-3xl" />
      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20">
            <span className="w-2 h-2 bg-[#38A169] rounded-full animate-pulse" />
            Plataforma B2B de ahorro empresarial
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 text-balance">
            Descubre cuánto puede{' '}
            <span className="text-[#68D391]">ahorrar</span>{' '}
            tu empresa
          </h1>

          <p className="text-xl text-white/75 mb-10 max-w-2xl leading-relaxed">
            Analiza tus gastos y encuentra soluciones reales en minutos. Conecta con proveedores verificados que ya han ayudado a más de 500 empresas a reducir costes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/savings-calculator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#38A169] text-white font-semibold text-lg rounded-xl hover:bg-[#2D8055] transition-all duration-150 active:scale-95 shadow-lg"
            >
              <Icon name="CalculatorIcon" size={22} />
              Calcular mi ahorro
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 text-white font-semibold text-lg rounded-xl hover:bg-white/25 border border-white/30 transition-all duration-150 active:scale-95 backdrop-blur-sm"
            >
              <Icon name="BuildingStorefrontIcon" size={22} />
              Soy proveedor
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            {[
              { value: '500+', label: 'Empresas clientes' },
              { value: '120+', label: 'Proveedores verificados' },
              { value: '€2.4M', label: 'Ahorros gestionados' },
            ]?.map((stat) => (
              <div key={`stat-${stat?.label}`} className="text-center">
                <p className="text-3xl font-bold text-white font-tabular">{stat?.value}</p>
                <p className="text-sm text-white/60 mt-1">{stat?.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating card */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block">
          <div className="bg-white rounded-2xl shadow-modal p-6 w-72 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#38A169]/15 rounded-xl flex items-center justify-center">
                <Icon name="ComputerDesktopIcon" size={22} className="text-[#38A169]" />
              </div>
              <div>
                <p className="text-xs text-[#718096] font-medium">Informática</p>
                <p className="text-sm font-semibold text-[#2D3748]">Ahorro estimado</p>
              </div>
            </div>
            <div className="bg-[#F0FBF4] rounded-xl p-4 mb-4">
              <p className="text-2xl font-bold text-[#38A169] font-tabular">3.000€ – 6.000€</p>
              <p className="text-xs text-[#38A169]/70 mt-1">al año con equipos reacondicionados</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#718096]">
              <Icon name="CheckBadgeIcon" size={14} className="text-[#38A169]" />
              <span>3 proveedores disponibles en tu zona</span>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-card p-4 w-72 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EEF2F8] rounded-xl flex items-center justify-center shrink-0">
              <Icon name="BoltIcon" size={20} className="text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-xs text-[#718096]">Energía · Análisis completado</p>
              <p className="text-sm font-semibold text-[#2D3748]">Ahorro de 8.400€/año detectado</p>
            </div>
            <span className="shrink-0 w-2 h-2 bg-[#38A169] rounded-full" />
          </div>
        </div>
      </div>
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="#F5F7FA" />
        </svg>
      </div>
    </section>
  );
}