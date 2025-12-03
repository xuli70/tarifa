import React from 'react';
import { X, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { HourlyPriceData, formatPrice, getPriceCategory } from '@/types/api';
import { reeApiService } from '@/services/reeApi';
import { cn } from '@/lib/utils';

interface PriceDetailModalProps {
  price: HourlyPriceData;
  allPrices: HourlyPriceData[];
  onClose: () => void;
}

export function PriceDetailModal({ price, allPrices, onClose }: PriceDetailModalProps) {
  const stats = reeApiService.calculatePriceStats(allPrices);
  const category = getPriceCategory(price.price, stats);
  
  // Calcular posición relativa
  const percentile = ((price.price - stats.min) / (stats.max - stats.min)) * 100;
  
  // Obtener contexto y recomendaciones
  const getRecommendation = () => {
    const hour = price.hour;
    
    if (category.type === 'cheap') {
      if (hour >= 0 && hour <= 6) {
        return 'Es horario nocturno con demanda baja. Ideal para electrodomésticos de alto consumo como lavavajillas y lavadora.';
      } else if (hour >= 14 && hour <= 16) {
        return 'Mediodía con menor demanda. Perfecto para tareas domésticas que requieran mucho tiempo.';
      }
      return 'Precio bajo. Aprovecha para usar electrodomésticos de alto consumo.';
    } else if (category.type === 'expensive') {
      if (hour >= 19 && hour <= 21) {
        return 'Hora punta de consumo doméstico. Evita usar electrodomésticos de alto consumo.';
      } else if (hour >= 8 && hour <= 9) {
        return 'Mañana con demanda elevada. Programa electrodomésticos para otras horas.';
      }
      return 'Precio alto. Pospone el uso de electrodomésticos de alto consumo.';
    }
    
    return 'Precio moderado. Puedes usar electrodomésticos sin preocupación especial.';
  };

  const getRelativePosition = () => {
    if (percentile <= 25) return 'Muy por debajo de la media';
    if (percentile <= 50) return 'Por debajo de la media';
    if (percentile <= 75) return 'Por encima de la media';
    return 'Muy por encima de la media';
  };

  const formatTimeRange = () => {
    const start = price.timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const end = new Date(price.timestamp.getTime() + 60*60*1000).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${start} - ${end}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center animate-fade-in">
      <div 
        className="bg-background-surface w-full max-w-md rounded-t-2xl p-6 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle para cerrar */}
        <div className="flex justify-center mb-4">
          <div className="w-8 h-1 bg-neutral-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-title font-semibold text-foreground mb-1">
              {formatTimeRange()}
            </h2>
            <p className="text-body-sm text-neutral-500">
              {price.timestamp.toLocaleDateString('es-ES', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="touch-target p-2 -m-2"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>
        
        {/* Precio destacado */}
        <div className="text-center mb-6">
          <div className={cn(
            'text-hero font-bold mb-2',
            category.type === 'cheap' && 'text-semantic-success',
            category.type === 'normal' && 'text-semantic-warning',
            category.type === 'expensive' && 'text-semantic-danger'
          )}>
            {formatPrice(price.price)}
          </div>
          <div className="text-body text-neutral-700 mb-3">€/kWh</div>
          
          <div className={cn(
            'inline-block px-3 py-1 rounded-full text-caption font-medium',
            category.type === 'cheap' && 'bg-semantic-success-bg text-semantic-success',
            category.type === 'normal' && 'bg-semantic-warning-bg text-semantic-warning',
            category.type === 'expensive' && 'bg-semantic-danger-bg text-semantic-danger'
          )}>
            {category.label}
          </div>
        </div>
        
        {/* Barra comparativa */}
        <div className="mb-6">
          <div className="flex justify-between text-caption text-neutral-500 mb-2">
            <span>Precio mínimo del día</span>
            <span>Precio máximo del día</span>
          </div>
          <div className="h-3 bg-neutral-200 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-semantic-success via-semantic-warning to-semantic-danger"
              style={{ width: '100%' }}
            />
            <div 
              className={cn(
                'absolute top-0 w-1 h-full bg-foreground rounded-full shadow-sm',
                category.type === 'cheap' && 'bg-semantic-success',
                category.type === 'normal' && 'bg-semantic-warning',
                category.type === 'expensive' && 'bg-semantic-danger'
              )}
              style={{ left: `${Math.min(Math.max(percentile, 0), 100)}%` }}
            />
          </div>
          <p className="text-center text-caption text-neutral-600 mt-2">
            {getRelativePosition()}
          </p>
        </div>
        
        {/* Indicadores */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown size={16} className="text-semantic-success" />
            </div>
            <div className="text-body-sm font-medium text-semantic-success">
              {formatPrice(stats.min)}€
            </div>
            <div className="text-caption text-neutral-500">Mínimo</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap size={16} className="text-neutral-600" />
            </div>
            <div className="text-body-sm font-medium text-neutral-700">
              {formatPrice(stats.average)}€
            </div>
            <div className="text-caption text-neutral-500">Media</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className="text-semantic-danger" />
            </div>
            <div className="text-body-sm font-medium text-semantic-danger">
              {formatPrice(stats.max)}€
            </div>
            <div className="text-caption text-neutral-500">Máximo</div>
          </div>
        </div>
        
        {/* Recomendación */}
        <div className="bg-neutral-100 rounded-lg p-4">
          <h3 className="text-body-sm font-semibold text-foreground mb-2">
            Recomendación
          </h3>
          <p className="text-body-sm text-neutral-700">
            {getRecommendation()}
          </p>
        </div>
        
        {/* Información adicional */}
        {price.isCurrent && (
          <div className="mt-4 bg-primary-100 rounded-lg p-3">
            <p className="text-caption font-medium text-primary-700">
              • Esta es la hora actual. El precio puede cambiar en la próxima hora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
