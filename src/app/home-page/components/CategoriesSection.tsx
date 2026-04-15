import React from 'react';
import Icon from '@/components/ui/AppIcon';

const categories = [
  {
    id: 'cat-informatica',
    icon: 'ComputerDesktopIcon',
    name: 'Informática',
    description: 'Equipos, licencias y servicios TI',
    savingsRange: '30% – 60%',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'cat-bienestar',
    icon: 'HeartIcon',
    name: 'Bienestar',
    description: 'Seguros médicos y beneficios empleados',
    savingsRange: '15% – 35%',
    color: '#EC4899',
    bgColor: '#FDF2F8',
  },
  {
    id: 'cat-mobiliario',
    icon: 'HomeIcon',
    name: 'Mobiliario',
    description: 'Oficina, ergonomía y equipamiento',
    savingsRange: '20% – 45%',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    id: 'cat-energia',
    icon: 'BoltIcon',
    name: 'Energía',
    description: 'Electricidad, gas y eficiencia',
    savingsRange: '25% – 50%',
    color: '#F97316',
    bgColor: '#FFF7ED',
  },
  {
    id: 'cat-limpieza',
    icon: 'SparklesIcon',
    name: 'Limpieza',
    description: 'Servicios de limpieza y mantenimiento',
    savingsRange: '20% – 40%',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
  },
  {
    id: 'cat-telecomunicaciones',
    icon: 'PhoneIcon',
    name: 'Telecomunicaciones',
    description: 'Móvil, internet y centralita',
    savingsRange: '30% – 55%',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  {
    id: 'cat-logistica',
    icon: 'TruckIcon',
    name: 'Logística',
    description: 'Envíos, almacén y transporte',
    savingsRange: '15% – 35%',
    color: '#38A169',
    bgColor: '#F0FBF4',
  },
  {
    id: 'cat-alimentacion',
    icon: 'ShoppingCartIcon',
    name: 'Alimentación',
    description: 'Catering, vending y suministros alimentarios',
    savingsRange: '10% – 30%',
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
];

export default function CategoriesSection() {
  return (
    <section id="categorias" className="py-20 bg-[#F5F7FA]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-[#38A169] uppercase tracking-widest mb-3 px-3 py-1 bg-[#F0FBF4] rounded-full">
            Áreas de ahorro
          </span>
          <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">
            ¿En qué área quieres ahorrar?
          </h2>
          <p className="text-lg text-[#718096] max-w-2xl mx-auto">
            Selecciona una categoría y descubre el potencial de ahorro para tu empresa en menos de 2 minutos.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-6"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: cat.bgColor }}
              >
                <Icon name={cat.icon as 'HomeIcon'} size={24} style={{ color: cat.color }} className="" />
              </div>
              <h3 className="text-base font-semibold text-[#2D3748] mb-1">{cat.name}</h3>
              <p className="text-sm text-[#718096] mb-4">{cat.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: cat.bgColor, color: cat.color }}
                >
                  Ahorro: {cat.savingsRange}
                </span>
                <Icon
                  name="ArrowRightIcon"
                  size={16}
                  className="text-[#CBD5E0]"
                />
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-[#1E3A5F] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                <Icon name="PlusIcon" size={24} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">¿Otra categoría?</h3>
              <p className="text-sm text-white/60">Cuéntanos tu caso y te ayudamos a encontrar soluciones.</p>
            </div>
            <a
              href="mailto:hola@eficia.es"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#68D391] hover:text-white transition-colors"
            >
              Contactar
              <Icon name="ArrowRightIcon" size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}