import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import ProviderPanelContent from './components/ProviderPanelContent';

export default function ProviderPanelPage() {
  return (
    <AppLayout userRole="provider">
      <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}>
        <ProviderPanelContent />
      </Suspense>
    </AppLayout>
  );
}