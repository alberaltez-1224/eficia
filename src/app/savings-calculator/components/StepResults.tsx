'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import SavingsBreakdownChart from './SavingsBreakdownChart';
import type { CalculatorData } from './SavingsCalculatorContent';

interface StepResultsProps {
  data: CalculatorData;
  onBack: () => void;
  onNext: () => void;
}

export default function StepResults({ data, onBack, onNext }: StepResultsProps) {
  if (!data.category) return null;

  const savingsPercMin = data.annualSpend > 0 ? Math.round((data.savingsMin / data.annualSpend) * 100) : 0;
  const savingsPercMax = data.annualSpend > 0 ? Math.round((data.savingsMax / data.annualSpend) * 100) : 0;

  const monthlyMin = Math.round(data.savingsMin / 12);
  const monthlyMax = Math.round(data.savingsMax / 12);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero result card */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#38A169]/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: data.category.bgColor }}>
              <Icon name={data.category.icon as 'HomeIcon'} size={20} style={{ color: data.category.color }} className="" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Análisis completado</p>
              <p className="text-white font-semibold text-sm">{data.category.name}</p>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-2">Ahorro potencial anual estimado</p>
          <p className="text-5xl font-bold font-tabular mb-2">
            €{data.savingsMin.toLocaleString('es-ES')} – €{data.savingsMax.toLocaleString('es-ES')}
          </p>
          <p className="text-white/60 text-sm">
            Entre el {savingsPercMin}% y el {savingsPercMax}% de tu gasto actual de €{data.annualSpend.toLocaleString('es-ES')}/año
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/15">
            <div>
              <p className="text-white/50 text-xs mb-0.5">Ahorro mensual</p>
              <p className="text-lg font-bold font-tabular">€{monthlyMin.toLocaleString('es-ES')} – €{monthlyMax.toLocaleString('es-ES')}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-0.5">Empleados analizados</p>
              <p className="text-lg font-bold font-tabular">{data.employees}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-0.5">Rango de ahorro</p>
              <p className="text-lg font-bold">{data.category.savingsRange}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SavingsBreakdownChart savingsMin={data.savingsMin} savingsMax={data.savingsMax} annualSpend={data.annualSpend} />

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6">
          <h3 className="text-base font-semibold text-[#2D3748] mb-4">¿Cómo se consigue este ahorro?</h3>
          <div className="space-y-3">
            {[
              { label: 'Optimización de contratos', pct: '30–40%' },
              { label: 'Cambio de proveedor', pct: '20–35%' },
              { label: 'Eficiencia operativa', pct: '15–25%' },
            ].map((item) => (
              <div key={`breakdown-${item.label}`} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#38A169] shrink-0" />
                <span className="text-sm text-[#718096] flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-[#2D3748]">{item.pct}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-[#E2E8F0]">
            <div className="flex items-start gap-2 text-xs text-[#718096]">
              <Icon name="InformationCircleIcon" size={14} className="shrink-0 mt-0.5" />
              <p>Estas estimaciones se basan en datos reales de empresas similares a la tuya. Los resultados finales pueden variar según el proveedor seleccionado y las condiciones específicas de tu empresa.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#F0FBF4] border border-[#A3EBC2] rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#38A169] rounded-xl flex items-center justify-center shrink-0">
            <Icon name="BuildingStorefrontIcon" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#2D3748] mb-1">¿Listo para hacer realidad este ahorro?</h3>
            <p className="text-sm text-[#718096]">
              Tenemos <strong className="text-[#38A169]">3–5 proveedores verificados</strong> en {data.category.name} que ya han conseguido estos resultados para empresas como la tuya.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-semibold text-[#718096] rounded-lg hover:bg-[#F5F7FA] transition-all duration-150"
        >
          <Icon name="ChevronLeftIcon" size={16} />
          Modificar datos
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#38A169] text-white text-sm font-semibold rounded-lg hover:bg-[#2D8055] transition-all duration-150 active:scale-95"
        >
          Ver proveedores disponibles
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>
    </div>
  );
}