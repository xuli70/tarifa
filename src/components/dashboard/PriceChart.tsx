import React from 'react';
import { HourlyPriceData, getPriceCategory, formatPrice } from '@/types/api';
import { reeApiService } from '@/services/reeApi';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  prices: HourlyPriceData[];
  onHourSelect: (price: HourlyPriceData) => void;
}

export function PriceChart({ prices, onHourSelect }: PriceChartProps) {
  // Calcular estadísticas para colores
  const stats = reeApiService.calculatePriceStats(prices);
  
  // Función para obtener el color según el precio
  const getBarColor = (price: number) => {
    const category = getPriceCategory(price, stats);
    switch (category.type) {
      case 'cheap':
        return '#10B981'; // semantic-success
      case 'normal':
        return '#F59E0B'; // semantic-warning
      case 'expensive':
        return '#EF4444'; // semantic-danger
      default:
        return '#737373';
    }
  };

  // Calcular altura relativa para cada barra
  const getBarHeight = (price: number) => {
    const normalized = (price - stats.min) / (stats.max - stats.min);
    return Math.max(normalized * 100, 5); // Mínimo 5% de altura
  };

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  return (
    <div className="card-base p-6 animate-fade-in">
      <div className="mb-4">
        <h2 className="text-subtitle font-semibold text-foreground mb-1">
          Precios por horas
        </h2>
        <p className="text-body-sm text-neutral-500">
          Toca una barra para ver detalles
        </p>
      </div>
      
      {/* Gráfico de barras */}
      <div className="h-64 flex items-end justify-between gap-1 px-2 mb-4">
        {prices.map((price, index) => {
          const height = getBarHeight(price.price);
          const isCurrent = price.isCurrent;
          
          return (
            <div
              key={price.hour}
              className="flex flex-col items-center flex-1 group cursor-pointer"
              onClick={() => onHourSelect(price)}
            >
              {/* Barra */}
              <div 
                className={cn(
                  'w-full rounded-t transition-all duration-300 group-hover:opacity-80',
                  'relative',
                  isCurrent && 'ring-2 ring-primary-500 ring-offset-1'
                )}
                style={{ 
                  height: `${height}%`,
                  backgroundColor: getBarColor(price.price),
                  minHeight: '8px'
                }}
              >
                {/* Indicador de hora actual */}
                {isCurrent && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  </div>
                )}
              </div>
              
              {/* Etiqueta de hora */}
              <span className={cn(
                'text-caption mt-1 transition-colors',
                price.hour % 3 === 0 ? 'text-neutral-500' : 'text-transparent',
                'group-hover:text-neutral-700'
              )}>
                {price.hour % 3 === 0 ? formatHour(price.hour) : ''}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Leyenda de colores */}
      <div className="flex justify-center gap-6 mb-4 text-caption">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-semantic-success" />
          <span className="text-neutral-500">Barato</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-semantic-warning" />
          <span className="text-neutral-500">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-semantic-danger" />
          <span className="text-neutral-500">Caro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-primary-500" />
          <span className="text-neutral-500">Ahora</span>
        </div>
      </div>
      
      {/* Tooltip flotante (aparece en hover) */}
      <div className="text-center text-caption text-neutral-500">
        Hover para ver detalles • Click para información completa
      </div>
      
      {/* Indicadores de min/max */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200">
        <div className="text-center">
          <p className="text-caption text-neutral-500">Mínimo</p>
          <p className="text-body font-semibold text-semantic-success">
            {formatPrice(stats.min)}€
          </p>
        </div>
        <div className="text-center">
          <p className="text-caption text-neutral-500">Promedio</p>
          <p className="text-body font-semibold text-neutral-700">
            {formatPrice(stats.average)}€
          </p>
        </div>
        <div className="text-center">
          <p className="text-caption text-neutral-500">Máximo</p>
          <p className="text-body font-semibold text-semantic-danger">
            {formatPrice(stats.max)}€
          </p>
        </div>
      </div>
    </div>
  );
}
