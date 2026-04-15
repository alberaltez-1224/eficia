import React from 'react';
import Icon from '@/components/ui/AppIcon';

const trustSignals = [
  {
    id: 'trust-verified',
    icon: 'CheckBadgeIcon',
    title: 'Proveedores verificados',
    description: 'Cada proveedor pasa un proceso de validación manual antes de aparecer en la plataforma. Documentación, referencias y calidad contrastada.',
    color: '#38A169',
    bgColor: '#F0FBF4',
  },
  {
    id: 'trust-nocommit',
    icon: 'HandRaisedIcon',
    title: 'Sin compromiso',
    description: 'Solicitar información a un proveedor no implica ningún contrato. Tú decides cuándo y con quién avanzar, sin presiones comerciales.',
    color: '#1E3A5F',
    bgColor: '#EEF2F8',
  },
  {
    id: 'trust-results',
    icon: 'ChartBarIcon',
    title: 'Resultados orientativos',
    description: 'Los ahorros estimados se basan en datos reales de empresas similares. Siempre mostramos rangos honestos, nunca cifras infladas.',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    id: 'trust-gdpr',
    icon: 'ShieldCheckIcon',
    title: 'Datos protegidos',
    description: 'Cumplimos con el RGPD. Tus datos nunca se venden ni comparten sin tu consentimiento explícito.',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
];

const stats = [
  { id: 'stat-companies', value: '500+', label: 'Empresas analizadas' },
  { id: 'stat-providers', value: '120+', label: 'Proveedores verificados' },
  { id: 'stat-savings', value: '€2.4M', label: 'En ahorros gestionados' },
  { id: 'stat-rating', value: '4.8/5', label: 'Valoración media' },
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-[#F5F7FA]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        {/* Stats banner */}
        <div className="bg-[#1E3A5F] rounded-2xl p-8 mb-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <p className="text-4xl font-bold text-white font-tabular mb-1">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-[#38A169] uppercase tracking-widest mb-3 px-3 py-1 bg-[#F0FBF4] rounded-full">
            Por qué confiar en Eficia
          </span>
          <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">
            Transparencia y rigor en cada paso
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {trustSignals.map((signal) => (
            <div key={signal.id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 card-hover">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: signal.bgColor }}
              >
                <Icon name={signal.icon as 'CheckBadgeIcon'} size={24} style={{ color: signal.color }} className="" />
              </div>
              <h3 className="text-base font-semibold text-[#2D3748] mb-2">{signal.title}</h3>
              <p className="text-sm text-[#718096] leading-relaxed">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}