'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const categoriesData = [
  {
    id: 'admin-cat-informatica',
    icon: 'ComputerDesktopIcon',
    name: 'Informática',
    description: 'Equipos, licencias y servicios TI',
    savingsRange: '30% – 60%',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    providers: 8,
    leads: 47,
    active: true,
    featured: true,
  },
  {
    id: 'admin-cat-energia',
    icon: 'BoltIcon',
    name: 'Energía',
    description: 'Electricidad, gas y eficiencia',
    savingsRange: '25% – 50%',
    color: '#F97316',
    bgColor: '#FFF7ED',
    providers: 12,
    leads: 38,
    active: true,
    featured: false,
  },
  {
    id: 'admin-cat-telecomunicaciones',
    icon: 'PhoneIcon',
    name: 'Telecomunicaciones',
    description: 'Móvil, internet y centralita',
    savingsRange: '30% – 55%',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    providers: 6,
    leads: 29,
    active: true,
    featured: false,
  },
  {
    id: 'admin-cat-bienestar',
    icon: 'HeartIcon',
    name: 'Bienestar',
    description: 'Seguros médicos y beneficios',
    savingsRange: '15% – 35%',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    providers: 5,
    leads: 21,
    active: true,
    featured: false,
  },
  {
    id: 'admin-cat-mobiliario',
    icon: 'HomeIcon',
    name: 'Mobiliario',
    description: 'Oficina, ergonomía y equipamiento',
    savingsRange: '20% – 45%',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    providers: 7,
    leads: 18,
    active: true,
    featured: false,
  },
  {
    id: 'admin-cat-limpieza',
    icon: 'SparklesIcon',
    name: 'Limpieza',
    description: 'Servicios de limpieza y mantenimiento',
    savingsRange: '20% – 40%',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    providers: 9,
    leads: 15,
    active: true,
    featured: false,
  },
  {
    id: 'admin-cat-logistica',
    icon: 'TruckIcon',
    name: 'Logística',
    description: 'Envíos, almacén y transporte',
    savingsRange: '15% – 35%',
    color: '#38A169',
    bgColor: '#F0FBF4',
    providers: 4,
    leads: 11,
    active: false,
    featured: false,
  },
];

export default function AdminCategoriesPanel() {
  const [categories, setCategories] = useState(categoriesData);

  const toggleActive = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, active: !c.active } : c)
    );
  };

  const toggleFeatured = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, featured: !c.featured } : c)
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#1E3A5F]">Gestión de categorías</h3>
          <p className="text-sm text-[#718096] mt-0.5">
            {categories.filter((c) => c.active).length} activas · {categories.filter((c) => c.featured).length} destacadas
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all active:scale-95">
          <Icon name="PlusIcon" size={16} />
          Nueva categoría
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-xl border shadow-card p-5 transition-all ${
              cat.active ? 'border-[#E2E8F0]' : 'border-[#E2E8F0] opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.active ? cat.bgColor : '#F5F7FA' }}
                >
                  <Icon name={cat.icon as 'HomeIcon'} size={20} style={{ color: cat.active ? cat.color : '#CBD5E0' }} className="" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#2D3748]">{cat.name}</h4>
                  <p className="text-xs text-[#718096]">{cat.description}</p>
                </div>
              </div>
              {cat.featured && (
                <span className="text-xs font-bold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <Icon name="StarIcon" size={10} />
                  Dest.
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center bg-[#F5F7FA] rounded-lg p-2">
                <p className="text-xs text-[#718096]">Proveedores</p>
                <p className="text-sm font-bold text-[#2D3748] font-tabular">{cat.providers}</p>
              </div>
              <div className="text-center bg-[#F5F7FA] rounded-lg p-2">
                <p className="text-xs text-[#718096]">Leads</p>
                <p className="text-sm font-bold text-[#2D3748] font-tabular">{cat.leads}</p>
              </div>
              <div className="text-center bg-[#F0FBF4] rounded-lg p-2">
                <p className="text-xs text-[#718096]">Ahorro</p>
                <p className="text-xs font-bold text-[#38A169]">{cat.savingsRange}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(cat.id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  cat.active
                    ? 'bg-[#F0FBF4] text-[#38A169] hover:bg-[#D1F5E0]'
                    : 'bg-red-50 text-red-500 hover:bg-red-100'
                }`}
              >
                {cat.active ? 'Activa' : 'Inactiva'}
              </button>
              <button
                onClick={() => toggleFeatured(cat.id)}
                title={cat.featured ? 'Quitar destacado' : 'Destacar categoría'}
                className={`p-2 rounded-lg transition-all ${
                  cat.featured
                    ? 'bg-[#FFFBEB] text-[#F59E0B] hover:bg-amber-100'
                    : 'bg-[#F5F7FA] text-[#CBD5E0] hover:text-[#F59E0B] hover:bg-[#FFFBEB]'
                }`}
              >
                <Icon name="StarIcon" size={16} />
              </button>
              <button
                title="Editar categoría"
                className="p-2 rounded-lg bg-[#F5F7FA] text-[#718096] hover:text-[#1E3A5F] hover:bg-[#EEF2F8] transition-all"
              >
                <Icon name="PencilIcon" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}