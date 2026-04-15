import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const categories = [
  { id: 'qs-energia', icon: 'BoltIcon', name: 'Energía', savings: '25–50%', color: '#F97316', bg: '#FFF7ED' },
  { id: 'qs-logistica', icon: 'TruckIcon', name: 'Logística', savings: '15–35%', color: '#38A169', bg: '#F0FBF4' },
  { id: 'qs-mobiliario', icon: 'HomeIcon', name: 'Mobiliario', savings: '20–45%', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'qs-informatica', icon: 'ComputerDesktopIcon', name: 'Informática', savings: '30–60%', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'qs-telecomunicaciones', icon: 'PhoneIcon', name: 'Telecomunicaciones', savings: '30–55%', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'qs-bienestar', icon: 'HeartIcon', name: 'Bienestar', savings: '15–35%', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'qs-limpieza', icon: 'SparklesIcon', name: 'Limpieza', savings: '20–40%', color: '#06B6D4', bg: '#ECFEFF' },
];

export default function QuickStartCategories() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#2D3748]">Áreas disponibles</h3>
        <span className="text-xs text-[#718096]">{categories.length} categorías</span>
      </div>

      <div className="space-y-2.5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href="/savings-calculator"
            className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#1E3A5F]/30 hover:bg-[#F5F7FA] transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
              <Icon name={cat.icon as 'HomeIcon'} size={16} style={{ color: cat.color }} className="" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2D3748]">{cat.name}</p>
              <p className="text-xs text-[#718096]">Ahorro potencial: {cat.savings}</p>
            </div>
            <Icon name="ArrowRightIcon" size={16} className="text-[#CBD5E0] group-hover:text-[#1E3A5F] transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      <Link
        href="/savings-calculator"
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95"
      >
        <Icon name="CalculatorIcon" size={16} />
        Iniciar nuevo análisis
      </Link>
    </div>
  );
}