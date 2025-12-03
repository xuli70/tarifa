import React from 'react';
import { TrendingUp, Euro, Percent, Target, Zap } from 'lucide-react';
import { OptimizationResult } from '@/types/api';
import { formatPrice } from '@/types/api';
import { cn } from '@/lib/utils';

interface SavingsSummaryProps {
  optimization: OptimizationResult;
}

export function SavingsSummary({ optimization }: SavingsSummaryProps) {
  const { 
    totalSavings, 
    baselineCost, 
    optimizedCost, 
    savingsPercentage,
    schedules,
    appliances 
  } = optimization;

  // Calcular estadísticas adicionales
  const totalPower = appliances.reduce((sum, app) => sum + app.power, 0);
  const totalDuration = appliances.reduce((sum, app) => sum + app.duration, 0);
  const totalConsumption = (totalPower * totalDuration) / 1000; // kWh

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getSavingsLevel = (percentage: number) => {
    if (percentage >= 25) return { label: 'Excelente', color: 'text-semantic-success', icon: '🎉' };
    if (percentage >= 15) return { label: 'Muy bueno', color: 'text-semantic-success', icon: '😊' };
    if (percentage >= 10) return { label: 'Bueno', color: 'text-semantic-warning', icon: '👍' };
    if (percentage >= 5) return { label: 'Moderado', color: 'text-semantic-warning', icon: '👌' };
    return { label: 'Mínimo', color: 'text-neutral-600', icon: '😐' };
  };

  const savingsLevel = getSavingsLevel(savingsPercentage);

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-semantic-success-bg rounded-lg">
          <TrendingUp size={20} className="text-semantic-success" />
        </div>
        <div>
          <h2 className="text-subtitle font-semibold text-foreground">
            Resumen de ahorros
          </h2>
          <p className="text-body-sm text-neutral-500">
            Cálculo de ahorro con la optimización
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-semantic-success-bg rounded-lg">
          <div className="text-title font-bold text-semantic-success mb-1">
            {formatCurrency(totalSavings)}
          </div>
          <div className="text-caption text-semantic-success font-medium">
            Ahorro total estimado
          </div>
        </div>
        
        <div className="text-center p-4 bg-primary-100 rounded-lg">
          <div className="text-title font-bold text-primary-600 mb-1">
            {formatPercentage(savingsPercentage)}
          </div>
          <div className="text-caption text-primary-600 font-medium">
            Porcentaje de ahorro
          </div>
        </div>
      </div>

      {/* Comparativa de costos */}
      <div className="space-y-4 mb-6">
        <h3 className="text-body-sm font-semibold text-foreground">
          Comparativa de costos
        </h3>
        
        <div className="space-y-3">
          {/* Costo sin optimizar */}
          <div className="flex items-center justify-between p-3 bg-semantic-danger-bg rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-semantic-danger/20 rounded-full">
                <Target size={16} className="text-semantic-danger" />
              </div>
              <div>
                <div className="text-body-sm font-medium text-foreground">
                  Sin optimizar
                </div>
                <div className="text-caption text-semantic-danger">
                  Usando horas más caras
                </div>
              </div>
            </div>
            <div className="text-body font-semibold text-semantic-danger">
              {formatCurrency(baselineCost)}
            </div>
          </div>

          {/* Costo optimizado */}
          <div className="flex items-center justify-between p-3 bg-semantic-success-bg rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-semantic-success/20 rounded-full">
                <Zap size={16} className="text-semantic-success" />
              </div>
              <div>
                <div className="text-body-sm font-medium text-foreground">
                  Optimizado
                </div>
                <div className="text-caption text-semantic-success">
                  Usando horas más baratas
                </div>
              </div>
            </div>
            <div className="text-body font-semibold text-semantic-success">
              {formatCurrency(optimizedCost)}
            </div>
          </div>

          {/* Diferencia */}
          <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Euro size={16} className="text-primary-600" />
              </div>
              <div>
                <div className="text-body-sm font-medium text-foreground">
                  Diferencia
                </div>
                <div className="text-caption text-neutral-600">
                  Ahorro mensual estimado
                </div>
              </div>
            </div>
            <div className="text-body font-semibold text-primary-600">
              -{formatCurrency(totalSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluación del ahorro */}
      <div className="p-4 bg-neutral-100 rounded-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">{savingsLevel.icon}</span>
          <div>
            <div className={cn('text-body-sm font-semibold', savingsLevel.color)}>
              Ahorro {savingsLevel.label}
            </div>
            <div className="text-caption text-neutral-600">
              {savingsPercentage >= 15 
                ? '¡Excelente optimización! Estás aprovechando muy bien las horas baratas.'
                : savingsPercentage >= 5
                  ? 'Buen ahorro. Considera ajustar las restricciones para optimizar más.'
                  : 'Ahorro limitado. Revisa las prioridades y restricciones de tus electrodomésticos.'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Proyección anual */}
      <div className="p-4 bg-primary-50 rounded-lg mb-6">
        <h4 className="text-body-sm font-semibold text-primary-800 mb-2">
          Proyección anual
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-title font-bold text-primary-600">
              {formatCurrency(totalSavings * 12)}
            </div>
            <div className="text-caption text-primary-700">
              Ahorro por año
            </div>
          </div>
          <div>
            <div className="text-title font-bold text-primary-600">
              {formatCurrency(totalSavings * 12 * 10)}
            </div>
            <div className="text-caption text-primary-700">
              Ahorro en 10 años
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-body font-semibold text-foreground">
            {appliances.length}
          </div>
          <div className="text-caption text-neutral-500">
            Electrodomésticos
          </div>
        </div>
        
        <div>
          <div className="text-body font-semibold text-foreground">
            {totalConsumption.toFixed(1)} kWh
          </div>
          <div className="text-caption text-neutral-500">
            Consumo total
          </div>
        </div>
        
        <div>
          <div className="text-body font-semibold text-foreground">
            {totalDuration}h
          </div>
          <div className="text-caption text-neutral-500">
            Tiempo total
          </div>
        </div>
      </div>

      {/* Consejos */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <h4 className="text-body-sm font-semibold text-foreground mb-3">
          Consejos para maximizar ahorros
        </h4>
        <ul className="space-y-2 text-body-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            <span>Programa lavavajillas y lavadora para las 02:00-05:00</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            <span>Evita usar electrodomésticos entre 19:00-21:00</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            <span>Revisa las restricciones para permitir más flexibilidad</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            <span>Aumenta la prioridad de electrodomésticos de alto consumo</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
