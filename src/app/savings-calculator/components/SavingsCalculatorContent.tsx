'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import StepCategorySelect from './StepCategorySelect';
import StepDataInput from './StepDataInput';
import StepResults from './StepResults';
import StepProviders from './StepProviders';

export type Category = {
  id: string;
  icon: string;
  name: string;
  description: string;
  savingsRange: string;
  savingsMin: number;
  savingsMax: number;
  color: string;
  bgColor: string;
};

export type CalculatorData = {
  category: Category | null;
  employees: number;
  annualSpend: number;
  extraData: Record<string, string | number>;
  savingsMin: number;
  savingsMax: number;
};

const steps = [
  { id: 'step-cat', number: 1, label: 'Área de ahorro' },
  { id: 'step-data', number: 2, label: 'Datos de empresa' },
  { id: 'step-results', number: 3, label: 'Tu ahorro estimado' },
  { id: 'step-providers', number: 4, label: 'Proveedores' },
];

export default function SavingsCalculatorContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [calcData, setCalcData] = useState<CalculatorData>({
    category: null,
    employees: 0,
    annualSpend: 0,
    extraData: {},
    savingsMin: 0,
    savingsMax: 0,
  });

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) setCurrentStep(step);
  };

  const updateData = (updates: Partial<CalculatorData>) => {
    setCalcData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 lg:px-8 xl:px-10 py-5">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Calculadora de ahorro</h1>
          <p className="text-sm text-[#718096] mt-0.5">Descubre cuánto puede ahorrar tu empresa en cada área de gasto</p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-8">
        {/* Step progress */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-[#E2E8F0] mx-10" />
            <div
              className="absolute left-10 top-5 h-0.5 bg-[#38A169] transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * (100 - (100 / steps.length))}%` }}
            />

            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <button
                  onClick={() => currentStep > step.number && goToStep(step.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    step.number < currentStep
                      ? 'bg-[#38A169] text-white cursor-pointer hover:bg-[#2D8055]'
                      : step.number === currentStep
                      ? 'bg-[#1E3A5F] text-white ring-4 ring-[#1E3A5F]/20'
                      : 'bg-white border-2 border-[#E2E8F0] text-[#CBD5E0] cursor-not-allowed'
                  }`}
                >
                  {step.number < currentStep ? (
                    <Icon name="CheckIcon" size={16} />
                  ) : (
                    step.number
                  )}
                </button>
                <span className={`text-xs font-semibold hidden sm:block ${
                  step.number === currentStep ? 'text-[#1E3A5F]' : step.number < currentStep ? 'text-[#38A169]' : 'text-[#CBD5E0]'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="animate-fade-in">
          {currentStep === 1 && (
            <StepCategorySelect
              selected={calcData.category}
              onSelect={(cat) => { updateData({ category: cat }); goToStep(2); }}
            />
          )}
          {currentStep === 2 && calcData.category && (
            <StepDataInput
              category={calcData.category}
              data={calcData}
              onBack={() => goToStep(1)}
              onNext={(data) => { updateData(data); goToStep(3); }}
            />
          )}
          {currentStep === 3 && (
            <StepResults
              data={calcData}
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          )}
          {currentStep === 4 && (
            <StepProviders
              category={calcData.category}
              savingsMin={calcData.savingsMin}
              savingsMax={calcData.savingsMax}
              onBack={() => goToStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}