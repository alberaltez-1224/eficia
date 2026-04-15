'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ChartPoint {
  month: string;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-dropdown p-4 min-w-[160px]">
        <p className="text-xs font-semibold text-[#718096] mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={`tooltip-${entry.name}`} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-[#718096]">Ahorro potencial</span>
            </div>
            <span className="text-xs font-bold text-[#2D3748] font-tabular">€{entry.value.toLocaleString('es-ES')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SavingsTrendChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) return;

      const { data: savings } = await supabase
        .from('savings')
        .select('savings_min, created_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: true });

      if (!savings || savings.length === 0) return;

      const monthMap: Record<string, number> = {};
      savings.forEach((row: any) => {
        const d = new Date(row.created_at);
        const key = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        monthMap[key] = (monthMap[key] || 0) + (row.savings_min || 0);
      });

      const points = Object.entries(monthMap).map(([month, total]) => ({ month, total }));
      setData(points);
      setTotalSavings(savings.reduce((s: number, r: any) => s + (r.savings_min || 0), 0));
    };

    fetchData();
  }, [user]);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-[#2D3748]">Evolución del ahorro potencial</h3>
          <p className="text-xs text-[#718096] mt-0.5">Acumulado por mes</p>
        </div>
        {totalSavings > 0 && (
          <span className="text-xs font-semibold text-[#38A169] bg-[#F0FBF4] px-3 py-1 rounded-full">
            +€{totalSavings.toLocaleString('es-ES')} potencial total
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#2D3748] mb-1">Sin datos todavía</p>
            <p className="text-xs text-[#718096]">Realiza tu primer análisis para ver la evolución</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38A169" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38A169" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" name="total" stroke="#38A169" strokeWidth={2} fill="url(#gradTotal)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}