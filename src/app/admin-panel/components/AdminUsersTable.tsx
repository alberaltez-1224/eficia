'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  name: string;
  contact: string;
  email: string;
  role: string;
  registeredDate: string;
  status: string;
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');

  useEffect(() => {
    const supabase = createClient();

    const fetchUsers = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (data) {
        setUsers(data.map((row: any) => ({
          id: row.id,
          name: row.full_name || row.email,
          contact: row.full_name || '',
          email: row.email || '',
          role: row.role === 'admin' ? 'Admin' : row.role === 'proveedor' ? 'Proveedor' : 'Cliente',
          registeredDate: new Date(row.created_at).toLocaleDateString('es-ES'),
          status: 'Activo',
        })));
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#2D3748]">Gestión de usuarios</h3>
            <p className="text-xs text-[#718096] mt-0.5">{users.length} usuarios registrados</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              placeholder="Buscar nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#2D3748] placeholder-[#CBD5E0] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#718096] bg-white focus:outline-none"
          >
            {['Todos', 'Cliente', 'Proveedor', 'Admin'].map((r) => (
              <option key={`role-filter-${r}`} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-[#F5F7FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="UsersIcon" size={24} className="text-[#CBD5E0]" />
          </div>
          <p className="text-sm font-semibold text-[#2D3748] mb-1">Sin usuarios todavía</p>
          <p className="text-xs text-[#718096]">Los usuarios registrados aparecerán aquí</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Registro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={user.id} className={`border-b border-[#F0F4F8] hover:bg-[#F5F7FA] transition-colors ${idx % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}>
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-semibold text-[#2D3748]">{user.name}</p>
                    <p className="text-xs text-[#718096]">{user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.role === 'Proveedor' ? 'bg-[#EEF2F8] text-[#1E3A5F]' :
                      user.role === 'Admin'? 'bg-red-50 text-red-600' : 'bg-[#FFFBEB] text-[#F59E0B]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#718096] font-tabular">{user.registeredDate}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F0FBF4] text-[#38A169]">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}