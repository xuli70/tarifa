import React from 'react';
import { Plus, Zap, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  onAddAppliance: () => void;
}

export function EmptyState({ onAddAppliance }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {/* Ilustración */}
      <div className="mb-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4">
          <Zap size={40} className="text-primary-600" />
        </div>
      </div>
      
      {/* Título y descripción */}
      <h2 className="text-title font-semibold text-foreground mb-2">
        Planifica tu consumo de electricidad
      </h2>
      <p className="text-body-sm text-neutral-600 mb-8 max-w-md mx-auto">
        Añade tus electrodomésticos para encontrar los horarios óptimos y ahorrar dinero en tu factura eléctrica.
      </p>
      
      {/* Botón principal */}
      <button
        onClick={onAddAppliance}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors text-body font-medium"
      >
        <Plus size={20} />
        Añadir mi primer electrodoméstico
      </button>
      
      {/* Beneficios */}
      <div className="mt-8 space-y-4">
        <h3 className="text-subtitle font-semibold text-foreground mb-4">
          ¿Cómo puede ayudarte?
        </h3>
        
        <div className="grid gap-4 max-w-md mx-auto">
          <div className="flex items-start gap-3 text-left">
            <div className="p-1 bg-semantic-success-bg rounded-full mt-0.5">
              <Lightbulb size={14} className="text-semantic-success" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">
                Ahorro automático
              </p>
              <p className="text-body-sm text-neutral-600">
                Encuentra las horas más baratas para usar tus electrodomésticos
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-left">
            <div className="p-1 bg-semantic-warning-bg rounded-full mt-0.5">
              <Lightbulb size={14} className="text-semantic-warning" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">
                Programación inteligente
              </p>
              <p className="text-body-sm text-neutral-600">
                Algoritmo que optimiza tus horarios según los precios en tiempo real
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-left">
            <div className="p-1 bg-primary-100 rounded-full mt-0.5">
              <Lightbulb size={14} className="text-primary-600" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">
                Control total
              </p>
              <p className="text-body-sm text-neutral-600">
                Define restricciones de horario y prioridades para cada aparato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
