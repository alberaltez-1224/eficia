import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function HomeFooter() {
  return (
    <footer className="bg-[#1E3A5F] text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo src="/assets/images/image-1776247061826.png" size={36} />
              <span className="font-bold text-xl text-white">Eficia</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Plataforma B2B de análisis de ahorro y marketplace de proveedores verificados.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Icon name="GlobeAltIcon" size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Icon name="EnvelopeIcon" size={16} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-2.5">
              {['Cómo funciona', 'Calculadora', 'Marketplace', 'Precios']?.map((item) => (
                <li key={`footer-plat-${item}`}>
                  <Link href="/home-page" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categorías</h4>
            <ul className="space-y-2.5">
              {['Informática', 'Energía', 'Telecomunicaciones', 'Bienestar', 'Mobiliario', 'Logística']?.map((cat) => (
                <li key={`footer-cat-${cat}`}>
                  <Link href="/savings-calculator" className="text-sm text-white/60 hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Política de privacidad', 'Términos de uso', 'Cookies', 'RGPD', 'Aviso legal']?.map((item) => (
                <li key={`footer-legal-${item}`}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © 2026 Eficia. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Icon name="ShieldCheckIcon" size={14} />
            <span>Cumplimiento RGPD · Datos seguros en España</span>
          </div>
        </div>
      </div>
    </footer>
  );
}