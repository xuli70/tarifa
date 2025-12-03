import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  message, 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 
        className={cn(
          'animate-spin text-primary-500',
          sizeClasses[size]
        )} 
      />
      {message && (
        <p className="mt-2 text-body-sm text-neutral-600 text-center">
          {message}
        </p>
      )}
    </div>
  );
}

// Componente para loading en pantalla completa
export function FullScreenLoader({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}
