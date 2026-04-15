import React from 'react';
import AppLayout from '@/components/AppLayout';
import SavingsCalculatorContent from './components/SavingsCalculatorContent';

export default function SavingsCalculatorPage() {
  return (
    <AppLayout userRole="client">
      <SavingsCalculatorContent />
    </AppLayout>
  );
}