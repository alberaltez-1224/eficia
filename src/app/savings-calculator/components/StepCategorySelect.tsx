'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Category } from './SavingsCalculatorContent';

const categories: Category[] = [
  {
    id: 'cat-informatica',
    icon: 'ComputerDesktopIcon',
    name: 'Informática',
    description: 'Muchas empresas pagan de más en informática. El uso de equipos reacondicionados y optimización tecnológica permite reducir costes entre un 30% y un 60% sin perder rendimiento.',
    savingsRange: '30% – 60%',
    savingsMin: 0.30,
    savingsMax: 0.60,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'cat-energia',
    icon: 'BoltIcon',
    name: 'Energía',
    description: 'Cambiar de tarifa, instalar sistemas de eficiencia energética o contratar con proveedores especializados puede suponer ahorros del 25% al 50% en la factura energética.',
    savingsRange: '25% – 50%',
    savingsMin: 0.25,
    savingsMax: 0.50,
    color: '#F97316',
    bgColor: '#FFF7ED',
  },
  {
    id: 'cat-telecomunicaciones',
    icon: 'PhoneIcon',
    name: 'Telecomunicaciones',
    description: 'Las tarifas corporativas mal negociadas suponen un sobrecoste habitual. Optimizando líneas, internet y centralita se logran reducciones del 30% al 55%.',
    savingsRange: '30% – 55%',
    savingsMin: 0.30,
    savingsMax: 0.55,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  {
    id: 'cat-bienestar',
    icon: 'HeartIcon',
    name: 'Bienestar',
    description: 'Seguros médicos grupales y planes de bienestar corporativo a precios preferentes. Las empresas con más de 10 empleados consiguen ahorros del 15% al 35%.',
    savingsRange: '15% – 35%',
    savingsMin: 0.15,
    savingsMax: 0.35,
    color: '#EC4899',
    bgColor: '#FDF2F8',
  },
  {
    id: 'cat-mobiliario',
    icon: 'HomeIcon',
    name: 'Mobiliario',
    description: 'Renovar o completar el equipamiento de oficina con descuentos corporativos exclusivos. Proyectos completos de 20–45% de ahorro respecto a precio de mercado.',
    savingsRange: '20% – 45%',
    savingsMin: 0.20,
    savingsMax: 0.45,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    id: 'cat-limpieza',
    icon: 'SparklesIcon',
    name: 'Limpieza',
    description: 'Servicios de limpieza profesional con contratos corporativos. La renegociación de contratos existentes suele generar ahorros del 20% al 40%.',
    savingsRange: '20% – 40%',
    savingsMin: 0.20,
    savingsMax: 0.40,
    color: '#06B6D4',
    bgColor: '#ECFEFF',
  },
  {
    id: 'cat-logistica',
    icon: 'TruckIcon',
    name: 'Logística',
    description: 'Optimización de envíos, almacén y transporte. Consolidando proveedores o renegociando contratos se obtienen reducciones del 15% al 35%.',
    savingsRange: '15% – 35%',
    savingsMin: 0.15,
    savingsMax: 0.35,
    color: '#38A169',
    bgColor: '#F0FBF4',
  },
  {
    id: 'cat-alimentacion',
    icon: 'ShoppingCartIcon',
    name: 'Alimentación',
    description: 'Optimización de compras de alimentación corporativa, catering y vending. Negociando con proveedores especializados se logran ahorros del 20% al 40%.',
    savingsRange: '20% – 40%',
    savingsMin: 0.20,
    savingsMax: 0.40,
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
];

interface StepCategorySelectProps {
  selected: Category | null;
  onSelect: (cat: Category) => void;
}

export default function StepCategorySelect({ selected, onSelect }: StepCategorySelectProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">¿En qué área quieres analizar el ahorro?</h2>
        <p className="text-[#718096]">Selecciona la categoría de gasto que más te interesa optimizar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={`text-left p-5 rounded-xl border transition-all duration-200 card-hover group ${
              selected?.id === cat.id
                ? 'border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20 bg-white'
                : 'border-[#E2E8F0] bg-white hover:border-[#1E3A5F]/40'
            }`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: cat.bgColor }}
            >
              <Icon name={cat.icon as 'HomeIcon'} size={24} style={{ color: cat.color }} className="" />
            </div>
            <h3 className="text-base font-semibold text-[#2D3748] mb-1">{cat.name}</h3>
            <p className="text-xs text-[#718096] mb-3 leading-relaxed line-clamp-2">{cat.description.split('.')[0]}.</p>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: cat.bgColor, color: cat.color }}
              >
                {cat.savingsRange}
              </span>
              <Icon name="ArrowRightIcon" size={14} className="text-[#CBD5E0] group-hover:text-[#1E3A5F] transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}