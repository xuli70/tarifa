import React, { useState } from 'react';
import { AppProvider } from './hooks/useAppState';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { Planner } from './components/planner/Planner';
import { Settings } from './components/settings/Settings';
import { DateHeader } from './components/layout/Header';
import { useApp } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';
import { PinLanding } from './components/auth/PinLanding';
import './index.css';

// Componente interno que usa el contexto
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { state, actions } = useApp();

  // Si no esta autenticado, mostrar landing de PIN
  if (!isAuthenticated) {
    return <PinLanding />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
        
      case 'planner':
        return <Planner />;
      case 'settings':
        return <Settings />;
      case 'info':
        return (
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-title font-semibold text-foreground mb-4">
              Información
            </h1>
            <p className="text-body-sm text-neutral-600">
              Funcionalidad en desarrollo...
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return undefined; // Ya tiene su propio header con fecha
      case 'planner':
        return 'Planificador';
      case 'settings':
        return 'Configuración';
      case 'info':
        return 'Información';
      default:
        return undefined;
    }
  };

  const getHeaderComponent = () => {
    if (activeTab === 'dashboard') {
      return (
        <DateHeader 
          currentDate={state.currentDate}
          onDateChange={(dateType: 'today' | 'tomorrow') => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const newDate = dateType === 'today' ? today : tomorrow;
            actions.setCurrentDate(newDate);
          }}
          loading={state.loading}
        />
      );
    }
    return null;
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerTitle={getHeaderTitle()}
      headerComponent={getHeaderComponent()}
      largeHeader={activeTab === 'dashboard'}
    >
      {renderContent()}
    </Layout>
  );
}

// Componente principal con el provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
