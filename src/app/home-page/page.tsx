import React from 'react';
import MarketingNav from '@/components/MarketingNav';
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TrustSection from './components/TrustSection';
import ProvidersSection from './components/ProvidersSection';
import HomeFooter from './components/HomeFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <MarketingNav />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <TrustSection />
      <ProvidersSection />
      <HomeFooter />
    </div>
  );
}