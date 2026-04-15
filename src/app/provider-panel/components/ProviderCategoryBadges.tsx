'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const categoryMeta: Record<string, { icon: string; color: string; bg: string }> = {
  'Informática':         { icon: 'ComputerDesktopIcon', color: '#3B82F6', bg: '#EFF6FF' },
  'Energía':             { icon: 'BoltIcon',            color: '#F97316', bg: '#FFF7ED' },
  'Telecomunicaciones':  { icon: 'PhoneIcon',           color: '#8B5CF6', bg: '#F5F3FF' },
  'Bienestar':           { icon: 'HeartIcon',           color: '#EC4899', bg: '#FDF2F8' },
  'Mobiliario':          { icon: 'HomeIcon',            color: '#F59E0B', bg: '#FFFBEB' },
  'Limpieza':            { icon: 'SparklesIcon',        color: '#06B6D4', bg: '#ECFEFF' },
  'Logística':           { icon: 'TruckIcon',           color: '#38A169', bg: '#F0FBF4' },
  'Alimentación':        { icon: 'ShoppingCartIcon',    color: '#D97706', bg: '#FFFBEB' },
};

interface CategoryItem {
  id: string;
  dbId: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  active: boolean;
}

export default function ProviderCategoryBadges() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const loadCategories = async () => {
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!provider) { setLoading(false); return; }
      setProviderId(provider.id);

      const [{ data: allCats }, { data: providerCats }] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('provider_categories').select('category_id').eq('provider_id', provider.id),
      ]);

      const activeCatIds = new Set((providerCats || []).map((pc: any) => pc.category_id));

      setCategories((allCats || []).map((cat: any) => {
        const meta = categoryMeta[cat.name] || { icon: 'TagIcon', color: '#718096', bg: '#F5F7FA' };
        return {
          id: `pcat-${cat.id}`,
          dbId: cat.id,
          name: cat.name,
          icon: meta.icon,
          color: meta.color,
          bg: meta.bg,
          active: activeCatIds.has(cat.id),
        };
      }));
      setLoading(false);
    };

    loadCategories();
  }, [user]);

  const toggleCategory = (id: string) => {
    setSavedOk(false);
    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, active: !c.active } : c)
    );
  };

  const handleSave = async () => {
    if (!providerId) return;
    setIsSaving(true);
    setSavedOk(false);
    const supabase = createClient();

    const activeCatIds = categories.filter((c) => c.active).map((c) => c.dbId);

    // Delete all existing and re-insert
    await supabase.from('provider_categories').delete().eq('provider_id', providerId);

    if (activeCatIds.length > 0) {
      await supabase.from('provider_categories').insert(
        activeCatIds.map((catId) => ({ provider_id: providerId, category_id: catId }))
      );
    }

    setIsSaving(false);
    setSavedOk(true);
  };

  const activeCount = categories.filter((c) => c.active).length;

  if (loading) {
    return (
      <div className="max-w-2xl bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {savedOk && (
        <div className="mb-4 bg-[#F0FBF4] border border-[#A3EBC2] rounded-xl p-3 flex items-center gap-2 text-sm text-[#38A169]">
          <Icon name="CheckCircleIcon" size={16} />
          Categorías guardadas correctamente
        </div>
      )}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-[#2D3748]">Categorías de servicio</h3>
          <span className="text-xs font-semibold text-[#1E3A5F] bg-[#EEF2F8] px-2.5 py-1 rounded-full">
            {activeCount} activas
          </span>
        </div>
        <p className="text-sm text-[#718096] mb-6">
          Selecciona las áreas donde puedes ofrecer ahorro a las empresas. Solo recibirás leads de las categorías activadas.
        </p>

        {categories.length === 0 ? (
          <p className="text-sm text-[#718096] text-center py-6">No hay categorías disponibles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                  cat.active
                    ? 'border-[#1E3A5F] bg-[#EEF2F8] ring-1 ring-[#1E3A5F]/20'
                    : 'border-[#E2E8F0] bg-white hover:border-[#1E3A5F]/30 hover:bg-[#F5F7FA]'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.active ? cat.bg : '#F5F7FA' }}
                >
                  <Icon name={cat.icon as 'HomeIcon'} size={20} style={{ color: cat.active ? cat.color : '#CBD5E0' }} className="" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${cat.active ? 'text-[#1E3A5F]' : 'text-[#718096]'}`}>{cat.name}</p>
                  <p className="text-xs text-[#A0AEC0]">{cat.active ? 'Activa — recibes leads' : 'Inactiva'}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  cat.active ? 'border-[#1E3A5F] bg-[#1E3A5F]' : 'border-[#CBD5E0]'
                }`}>
                  {cat.active && <Icon name="CheckIcon" size={10} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-all duration-150 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Guardando...</>
          ) : (
            <><Icon name="CheckIcon" size={16} />Guardar categorías</>
          )}
        </button>
      </div>
    </div>
  );
}