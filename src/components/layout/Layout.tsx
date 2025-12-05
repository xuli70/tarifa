import React, { ReactNode } from 'react';
import { TabNavigation } from './TabNavigation';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  headerTitle?: string;
  headerAction?: ReactNode;
  headerComponent?: ReactNode;
  largeHeader?: boolean;
}

export function Layout({
  children,
  activeTab,
  onTabChange,
  headerTitle,
  headerAction,
  headerComponent,
  largeHeader = false
}: LayoutProps) {
  return (
    <div className="min-h-screen-safe bg-background-primary flex flex-col">
      {/* Header fijo */}
      {headerComponent || <Header title={headerTitle} action={headerAction} />}
      
      {/* Contenido principal */}
      <main className={`flex-1 nav-bottom-spacing ${largeHeader ? 'nav-top-spacing-lg' : 'nav-top-spacing'}`}>
        {children}
      </main>
      
      {/* Navegación inferior */}
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
