import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClientDashboardContent from './components/ClientDashboardContent';

export default function ClientDashboardPage() {
  return (
    <AppLayout userRole="client">
      <ClientDashboardContent />
    </AppLayout>
  );
}