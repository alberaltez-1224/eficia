'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import type { Category, CalculatorData } from './SavingsCalculatorContent';

interface StepDataInputProps {
  category: Category;
  data: CalculatorData;
  onBack: () => void;
  onNext: (data: Partial<CalculatorData>) => void;
}

interface FormData {
  employees: number;
  annualSpend: number;
  devices?: number;
  sqMeters?: number;
  mobileLines?: number;
  monthlyShipments?: number;
}

export default function StepDataInput({ category, data, onBack, onNext }: StepDataInputProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      employees: data.employees || undefined,
      annualSpend: data.annualSpend || undefined,
    },
  });

  const employees = watch('employees');
  const annualSpend = watch('annualSpend');

  const onSubmit = (formData: FormData) => {
    const savingsMin = Math.round((formData.annualSpend || 0) * category.savingsMin);
    const savingsMax = Math.round((formData.annualSpend || 0) * category.savingsMax);
    onNext({
      employees: Number(formData.employees),
      annualSpend: Number(formData.annualSpend),
      extraData: { ...formData },
      savingsMin,
      savingsMax,
    });
  };

  const previewSavingsMin = annualSpend ? Math.round(Number(annualSpend) * category.savingsMin) : 0;
  const previewSavingsMax = annualSpend ? Math.round(Number(annualSpend) * category.savingsMax) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Category context */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.bgColor }}
          >
            <Icon name={category.icon as 'HomeIcon'} size={28} style={{ color: category.color }} className="" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-1">{category.name}</h2>
            <p className="text-sm text-[#718096] leading-relaxed">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 mb-6">
          <h3 className="text-base font-semibold text-[#2D3748] mb-5">Datos de tu empresa</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Employees */}
            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="calc-employees">
                Número de empleados <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-[#718096] mb-2">El total de personas en plantilla</p>
              <input
                id="calc-employees"
                type="number"
                min="1"
                placeholder="45"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-tabular ${errors.employees ? 'border-red-400' : 'border-[#E2E8F0]'}`}
                {...register('employees', { required: 'Obligatorio', min: { value: 1, message: 'Mínimo 1 empleado' } })}
              />
              {errors.employees && <p className="mt-1 text-xs text-red-500">{errors.employees.message}</p>}
            </div>

            {/* Annual spend */}
            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="calc-spend">
                Gasto anual en {category.name} (€) <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-[#718096] mb-2">Importe total que gastas actualmente al año</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#718096] font-semibold">€</span>
                <input
                  id="calc-spend"
                  type="number"
                  min="0"
                  placeholder="18000"
                  className={`w-full pl-8 pr-4 py-3 text-sm border rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-tabular ${errors.annualSpend ? 'border-red-400' : 'border-[#E2E8F0]'}`}
                  {...register('annualSpend', { required: 'Obligatorio' })}
                />
              </div>
              {errors.annualSpend && <p className="mt-1 text-xs text-red-500">{errors.annualSpend.message}</p>}
            </div>

            {/* Category-specific fields */}
            {category.id === 'cat-informatica' && (
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="calc-devices">
                  Número de equipos (PCs, portátiles)
                </label>
                <input
                  id="calc-devices"
                  type="number"
                  min="0"
                  placeholder="45"
                  className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-tabular"
                  {...register('devices')}
                />
              </div>
            )}

            {category.id === 'cat-energia' && (
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="calc-sqm">
                  Superficie de las oficinas (m²)
                </label>
                <input
                  id="calc-sqm"
                  type="number"
                  min="0"
                  placeholder="800"
                  className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-tabular"
                  {...register('sqMeters')}
                />
              </div>
            )}

            {category.id === 'cat-telecomunicaciones' && (
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="calc-lines">
                  Líneas móviles corporativas
                </label>
                <input
                  id="calc-lines"
                  type="number"
                  min="0"
                  placeholder="45"
                  className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-tabular"
                  {...register('mobileLines')}
                />
              </div>
            )}

            {category.id === 'cat-logistica' && (
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-1.5" htmlFor="calc-shipments">
                  Envíos mensuales aproximados
                </label>
                <input
                  id="calc-shipments"
                  type="number"
                  min="0"
                  placeholder="200"
                  className="w-full px-4 py-3 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all font-tabular"
                  {...register('monthlyShipments')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        {annualSpend > 0 && (
          <div className="bg-[#F0FBF4] border border-[#A3EBC2] rounded-xl p-5 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="SparklesIcon" size={18} className="text-[#38A169]" />
              <p className="text-sm font-semibold text-[#38A169]">Vista previa del ahorro estimado</p>
            </div>
            <p className="text-3xl font-bold text-[#38A169] font-tabular">
              €{previewSavingsMin.toLocaleString('es-ES')} – €{previewSavingsMax.toLocaleString('es-ES')}
            </p>
            <p className="text-xs text-[#38A169]/70 mt-1">
              Basado en {category.savingsRange} de ahorro sobre €{Number(annualSpend).toLocaleString('es-ES')}/año
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-sm font-semibold text-[#718096] rounded-lg hover:bg-[#F5F7FA] transition-all duration-150"
          >
            <Icon name="ChevronLeftIcon" size={16} />
            Cambiar categoría
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95"
          >
            Ver mi ahorro estimado
            <Icon name="ChevronRightIcon" size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}