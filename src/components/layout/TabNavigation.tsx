import React from 'react';
import { Zap, Calendar, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Zap,
  },
  {
    id: 'planner',
    label: 'Planificador',
    icon: Calendar,
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
  },
  {
    id: 'info',
    label: 'Info',
    icon: Info,
  },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-primary border-t border-neutral-200 safe-bottom">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors duration-300',
                  isActive 
                    ? 'text-primary-500' 
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <Icon 
                  size={24} 
                  className={cn(
                    'mb-1 transition-colors duration-300',
                    isActive ? 'text-primary-500' : 'text-neutral-500'
                  )} 
                />
                <span 
                  className={cn(
                    'text-caption transition-colors duration-300',
                    isActive ? 'text-primary-500' : 'text-neutral-500'
                  )}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
