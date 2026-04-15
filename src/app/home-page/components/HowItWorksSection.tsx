'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

const steps = [
  {
    id: 'step-1',
    number: '01',
    icon: 'TagIcon',
    title: 'Selecciona el área',
    description: 'Elige la categoría de gasto donde crees que tu empresa puede mejorar: informática, energía, telecomunicaciones y más.',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'step-2',
    number: '02',
    icon: 'DocumentTextIcon',
    title: 'Introduce tus datos',
    description: 'Rellena un formulario rápido con información básica: número de empleados, gasto actual y características de tu empresa.',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  {
    id: 'step-3',
    number: '03',
    icon: 'ChartBarIcon',
    title: 'Descubre tu ahorro',
    description: 'Recibe al instante un análisis con el rango de ahorro estimado, basado en datos reales de empresas similares a la tuya.',
    color: '#38A169',
    bgColor: '#F0FBF4',
  },
  {
    id: 'step-4',
    number: '04',
    icon: 'BuildingStorefrontIcon',
    title: 'Contacta proveedores',
    description: 'Conecta con proveedores verificados que ya han conseguido ese ahorro para otras empresas. Sin compromiso.',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
];

export default function HowItWorksSection() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleStartAnalysis = () => {
    if (loading) return;
    if (user) {
      router.push('/savings-calculator');
    } else {
      router.push('/sign-up-login-screen');
    }
  };

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-[#1E3A5F] uppercase tracking-widest mb-3 px-3 py-1 bg-[#EEF2F8] rounded-full">
            Proceso
          </span>
          <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">
            Cómo funciona Eficia
          </h2>
          <p className="text-lg text-[#718096] max-w-xl mx-auto">
            En menos de 5 minutos, identifica oportunidades de ahorro reales para tu empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden xl:block absolute top-10 left-[calc(100%-16px)] w-8 h-0.5 bg-[#E2E8F0] z-0" />
              )}

              <div className="relative z-10">
                {/* Number badge */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl font-bold text-[#E2E8F0] font-tabular">{step.number}</span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <Icon name={step.icon as 'TagIcon'} size={24} style={{ color: step.color }} className="" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">{step.title}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleStartAnalysis}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E3A5F] text-white font-semibold rounded-xl hover:bg-[#2C5282] transition-all duration-150 active:scale-95 shadow-card"
          >
            <Icon name="CalculatorIcon" size={20} />
            Empezar análisis gratuito
          </button>
          <p className="text-sm text-[#718096] mt-3">Registro requerido · Sin compromiso</p>
        </div>
      </div>
    </section>
  );
}