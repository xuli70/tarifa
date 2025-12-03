import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  onRetry, 
  showRetry = true,
  className 
}: ErrorMessageProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 text-center',
      className
    )}>
      <div className="p-3 bg-semantic-danger-bg rounded-full mb-4">
        <AlertCircle size={24} className="text-semantic-danger" />
      </div>
      
      <h3 className="text-subtitle font-semibold text-foreground mb-2">
        Error al cargar datos
      </h3>
      
      <p className="text-body-sm text-neutral-600 mb-4 max-w-sm">
        {message}
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      )}
    </div>
  );
}

// Componente para errores en línea
export function InlineError({ 
  message, 
  className 
}: { 
  message: string; 
  className?: string; 
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-3 bg-semantic-danger-bg rounded-lg',
      className
    )}>
      <AlertCircle size={16} className="text-semantic-danger flex-shrink-0" />
      <span className="text-body-sm text-semantic-danger">
        {message}
      </span>
    </div>
  );
}
