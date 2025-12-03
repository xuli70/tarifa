import React, { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  action?: ReactNode;
  showMenu?: boolean;
  className?: string;
}

export function Header({ 
  title, 
  action, 
  showMenu = false,
  className 
}: HeaderProps) {
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-40 bg-background-primary/95 backdrop-blur-sm border-b border-neutral-200 safe-top',
      className
    )}>
      <div className="container mx-auto h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showMenu && (
            <button className="touch-target p-2 -m-2">
              <Menu size={20} className="text-neutral-700" />
            </button>
          )}
          
          {title && (
            <h1 className="text-title font-semibold text-foreground truncate">
              {title}
            </h1>
          )}
        </div>
        
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}

// Header específico para selección de fecha
interface DateHeaderProps {
  currentDate: Date;
  onDateChange: (date: 'today' | 'tomorrow') => void;
  loading?: boolean;
}

export function DateHeader({ currentDate, onDateChange, loading }: DateHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDateStatus = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (currentDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (currentDate.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    }
    return null;
  };

  const status = getDateStatus();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background-primary/95 backdrop-blur-sm border-b border-neutral-200 safe-top">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          {/* Título de la aplicación */}
          <h1 className="text-title font-semibold text-foreground">
            Precios Electricidad
          </h1>
          
          {/* Selector de fecha y fecha formateada */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-sm text-neutral-500">
                {formatDate(currentDate)}
              </span>
            </div>
            
            {/* Botones de selección Hoy/Mañana */}
            <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => onDateChange('today')}
                className={cn(
                  'px-3 py-1 rounded-md text-caption font-medium transition-all duration-200',
                  status === 'Hoy'
                    ? 'bg-background-primary text-foreground shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
              >
                Hoy
              </button>
              <button
                onClick={() => onDateChange('tomorrow')}
                disabled={loading}
                className={cn(
                  'px-3 py-1 rounded-md text-caption font-medium transition-all duration-200',
                  status === 'Mañana'
                    ? 'bg-background-primary text-foreground shadow-sm'
                    : loading
                      ? 'text-neutral-300 cursor-not-allowed'
                      : 'text-neutral-600 hover:text-neutral-800'
                )}
                title={loading ? 'Cargando precios...' : ''}
              >
                Mañana {loading && '⏰'}
              </button>
            </div>
          </div>
          
          {/* Indicador de estado de carga */}
          {loading && (
            <div className="flex items-center gap-2 text-body-sm text-neutral-500">
              <div className="w-3 h-3 border border-neutral-300 border-t-primary-500 rounded-full animate-spin" />
              <span>Actualizando precios...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
