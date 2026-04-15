'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userRole: 'client' | 'provider' | 'admin';
}

const clientNavItems = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: 'HomeIcon', href: '/client-dashboard' },
  { id: 'nav-calculator', label: 'Calculadora', icon: 'CalculatorIcon', href: '/savings-calculator' },
  { id: 'nav-leads', label: 'Mis Solicitudes', icon: 'EnvelopeIcon', href: '/client-dashboard' },
  { id: 'nav-providers', label: 'Proveedores', icon: 'BuildingStorefrontIcon', href: '/home-page' },
  { id: 'nav-reports', label: 'Informes', icon: 'ChartBarIcon', href: '/client-dashboard' },
];

const providerNavItems = [
  { id: 'nav-provider-dash', label: 'Panel', icon: 'HomeIcon', href: '/provider-panel', tab: '' },
  { id: 'nav-leads-provider', label: 'Leads', icon: 'UsersIcon', href: '/provider-panel?tab=leads', tab: 'leads' },
  { id: 'nav-profile', label: 'Mi Perfil', icon: 'UserCircleIcon', href: '/provider-panel?tab=profile', tab: 'profile' },
  { id: 'nav-categories', label: 'Categorías', icon: 'TagIcon', href: '/provider-panel?tab=categories', tab: 'categories' },
  { id: 'nav-analytics', label: 'Estadísticas', icon: 'ChartPieIcon', href: '/provider-panel?tab=stats', tab: 'stats' },
];

const adminNavItems = [
  { id: 'nav-admin-dash', label: 'Resumen', icon: 'HomeIcon', href: '/admin-panel' },
  { id: 'nav-admin-users', label: 'Usuarios', icon: 'UsersIcon', href: '/admin-panel' },
  { id: 'nav-admin-providers', label: 'Proveedores', icon: 'BuildingStorefrontIcon', href: '/admin-panel' },
  { id: 'nav-admin-leads', label: 'Leads', icon: 'EnvelopeIcon', href: '/admin-panel' },
  { id: 'nav-admin-categories', label: 'Categorías', icon: 'TagIcon', href: '/admin-panel' },
  { id: 'nav-admin-stats', label: 'Estadísticas', icon: 'ChartBarIcon', href: '/admin-panel' },
];

export default function Sidebar({ collapsed, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('');
  const [displayEmail, setDisplayEmail] = useState<string>('');

  useEffect(() => {
    if (user) {
      setDisplayEmail(user.email || '');
      const meta = user.user_metadata;
      setDisplayName(meta?.full_name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-up-login-screen');
      router.refresh();
    } catch (e) {
      // ignore
    }
  };

  const navItems =
    userRole === 'admin' ? adminNavItems :
    userRole === 'provider' ? providerNavItems :
    clientNavItems;

  const roleLabel =
    userRole === 'admin' ? 'Administrador' :
    userRole === 'provider' ? 'Proveedor' :
    'Empresa Cliente';

  const roleInitials = displayName ? displayName.slice(0, 2).toUpperCase() : (
    userRole === 'admin' ? 'AD' :
    userRole === 'provider' ? 'PR' : 'EC'
  );

  const currentTab = searchParams.get('tab') || '';

  const isItemActive = (item: typeof navItems[0]) => {
    if (userRole === 'provider') {
      const itemTab = (item as any).tab ?? '';
      return pathname === '/provider-panel' && currentTab === itemTab;
    }
    return pathname === item.href;
  };

  return (
    <aside
      className={`flex flex-col bg-[#1E3A5F] text-white transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      } h-screen`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-white/10 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <AppLogo
          src="/assets/images/image-1776247061826.png"
          size={32}
          className="shrink-0"
        />
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-white">
            Eficia
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2 bg-white/10 rounded-lg">
          <p className="text-xs font-500 text-white/60 uppercase tracking-wider mb-0.5">Rol</p>
          <p className="text-sm font-semibold text-white">{roleLabel}</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? 'bg-white/15 text-white font-semibold' :'text-white/70 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                name={item.icon as 'HomeIcon'}
                size={20}
                className={`shrink-0 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}
              />
              {!collapsed && (
                <span className="flex-1 text-sm">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="bg-savings-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 bg-savings-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <Icon name="ArrowRightOnRectangleIcon" size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar sesión</span>}
        </button>

        <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-savings-500 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{roleInitials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {displayName || roleLabel}
              </p>
              <p className="text-xs text-white/50 truncate">
                {displayEmail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <Icon
          name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
          size={16}
        />
      </button>
    </aside>
  );
}