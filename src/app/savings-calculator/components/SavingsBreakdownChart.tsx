'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SavingsBreakdownChartProps {
  savingsMin: number;
  savingsMax: number;
  annualSpend: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-dropdown p-3">
        <p className="text-xs font-semibold text-[#718096] mb-1">{label}</p>
        <p className="text-sm font-bold text-[#2D3748] font-tabular">€{payload[0].value.toLocaleString('es-ES')}</p>
      </div>
    );
  }
  return null;
};

export default function SavingsBreakdownChart({ savingsMin, savingsMax, annualSpend }: SavingsBreakdownChartProps) {
  const remaining = annualSpend - savingsMax;

  const data = [
    { name: 'Gasto actual', value: annualSpend, color: '#CBD5E0' },
    { name: 'Ahorro mín.', value: savingsMin, color: '#68D391' },
    { name: 'Ahorro máx.', value: savingsMax, color: '#38A169' },
    { name: 'Coste restante', value: remaining > 0 ? remaining : 0, color: '#A0AEC0' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6">
      <h3 className="text-base font-semibold text-[#2D3748] mb-1">Desglose del ahorro</h3>
      <p className="text-xs text-[#718096] mb-4">Comparativa gasto actual vs. ahorro potencial (€/año)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}