'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-[#E2E8F0]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home-page" className="flex items-center gap-2.5">
          <AppLogo
            src="/assets/images/image-1776247061826.png"
            size={36}
          />
          <span
            className={`font-bold text-xl tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-[#1E3A5F]' : 'text-white'
            }`}
          >
            Eficia
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Cómo funciona', href: '#como-funciona' },
            { label: 'Categorías', href: '#categorias' },
            { label: 'Proveedores', href: '#proveedores' },
          ]?.map((item) => (
            <a
              key={`nav-${item?.label}`}
              href={item?.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                scrolled
                  ? 'text-[#2D3748] hover:text-[#1E3A5F]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item?.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-up-login-screen"
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 ${
              scrolled
                ? 'text-[#1E3A5F] hover:bg-[#1E3A5F]/10'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up-login-screen"
            className="text-sm font-semibold px-4 py-2 bg-[#38A169] text-white rounded-lg hover:bg-[#2D8055] transition-all duration-150 active:scale-95"
          >
            Calcular ahorro
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? 'text-[#1E3A5F]' : 'text-white'
          }`}
          aria-label="Abrir menú"
        >
          <Icon name={mobileOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
        </button>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] shadow-dropdown animate-fade-in">
          <div className="px-6 py-4 space-y-3">
            <a href="#como-funciona" className="block text-sm font-medium text-[#2D3748] py-2">Cómo funciona</a>
            <a href="#categorias" className="block text-sm font-medium text-[#2D3748] py-2">Categorías</a>
            <a href="#proveedores" className="block text-sm font-medium text-[#2D3748] py-2">Proveedores</a>
            <hr className="border-[#E2E8F0]" />
            <Link href="/sign-up-login-screen" className="block text-sm font-semibold text-[#1E3A5F] py-2">
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="block text-sm font-semibold px-4 py-2.5 bg-[#38A169] text-white rounded-lg text-center"
            >
              Calcular ahorro
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}