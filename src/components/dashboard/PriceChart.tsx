import React, { useState } from 'react';
import { HourlyPriceData, getPriceCategory, formatPrice } from '@/types/api';
import { reeApiService } from '@/services/reeApi';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  prices: HourlyPriceData[];
  onHourSelect: (price: HourlyPriceData) => void;
}

// Definición de franjas horarias
const TIME_SLOTS = [
  { name: 'Madrugada', start: 0, end: 6, bgClass: 'bg-slate-50' },
  { name: 'Mañana', start: 6, end: 12, bgClass: 'bg-white' },
  { name: 'Tarde', start: 12, end: 18, bgClass: 'bg-amber-50/40' },
  { name: 'Noche', start: 18, end: 24, bgClass: 'bg-slate-100/60' },
];

export function PriceChart({ prices, onHourSelect }: PriceChartProps) {
  const [hoveredPrice, setHoveredPrice] = useState<HourlyPriceData | null>(null);

  // Calcular estadísticas para colores
  const stats = reeApiService.calculatePriceStats(prices);

  // Función para obtener el gradiente según el precio
  const getBarGradient = (price: number) => {
    const category = getPriceCategory(price, stats);
    switch (category.type) {
      case 'cheap':
        return 'linear-gradient(to top, #059669, #10B981, #34D399)';
      case 'normal':
        return 'linear-gradient(to top, #D97706, #F59E0B, #FBBF24)';
      case 'expensive':
        return 'linear-gradient(to top, #DC2626, #EF4444, #F87171)';
      default:
        return 'linear-gradient(to top, #525252, #737373)';
    }
  };

  // Función para obtener la sombra según el precio
  const getBarShadow = (price: number) => {
    const category = getPriceCategory(price, stats);
    switch (category.type) {
      case 'cheap':
        return '0 2px 8px rgba(16, 185, 129, 0.3)';
      case 'normal':
        return '0 2px 8px rgba(245, 158, 11, 0.3)';
      case 'expensive':
        return '0 2px 8px rgba(239, 68, 68, 0.3)';
      default:
        return '0 2px 8px rgba(0, 0, 0, 0.1)';
    }
  };

  // Constantes para el cálculo de alturas
  const BASE_HEIGHT = 30; // Altura mínima de las barras (30%)
  const RANGE = 70; // Rango de variación (70%)

  // Calcular altura relativa para cada barra
  const getBarHeight = (price: number) => {
    const normalized = (price - stats.min) / (stats.max - stats.min);
    // Altura base de 30%, rango de 70% para variación
    return BASE_HEIGHT + (normalized * RANGE);
  };

  // Calcular posición de la línea de media (usando la misma escala)
  const normalizedAverage = (stats.average - stats.min) / (stats.max - stats.min);
  const averageLinePosition = BASE_HEIGHT + (normalizedAverage * RANGE);

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  // Obtener la franja horaria de una hora
  const getTimeSlot = (hour: number) => {
    return TIME_SLOTS.find(slot => hour >= slot.start && hour < slot.end);
  };

  return (
    <div className="card-base p-5 animate-fade-in outline-none">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-subtitle font-semibold text-foreground mb-1">
          Precios por horas
        </h2>
        <p className="text-body-sm text-neutral-500">
          Toca una barra para ver detalles
        </p>
      </div>

      {/* Etiquetas de franjas horarias */}
      <div className="flex mb-2">
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot.name}
            className="flex-1 text-center"
            style={{ width: `${(slot.end - slot.start) / 24 * 100}%` }}
          >
            <span className="text-caption font-medium text-neutral-400 uppercase tracking-wide">
              {slot.name}
            </span>
          </div>
        ))}
      </div>

      {/* Contenedor del gráfico con franjas de fondo */}
      <div className="relative h-64 mb-4 overflow-hidden rounded-lg px-1">
        {/* Fondos de franjas horarias */}
        <div className="absolute inset-0 flex rounded-lg overflow-hidden">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.name}
              className={cn(slot.bgClass, 'transition-colors')}
              style={{ width: `${(slot.end - slot.start) / 24 * 100}%` }}
            />
          ))}
        </div>

        {/* Línea de media */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-neutral-300 z-10 pointer-events-none"
          style={{ bottom: `${averageLinePosition}%` }}
        >
          <span className="absolute right-0 -top-5 text-caption text-neutral-500 bg-white/80 px-1.5 py-0.5 rounded">
            Media: {formatPrice(stats.average)}€
          </span>
        </div>

        {/* Gráfico de barras */}
        <div className="relative h-full flex items-end z-20 gap-px sm:gap-0.5">
          {prices.map((price) => {
            const height = getBarHeight(price.price);
            const isCurrent = price.isCurrent;
            const isHovered = hoveredPrice?.hour === price.hour;
            const category = getPriceCategory(price.price, stats);

            return (
              <div
                key={price.hour}
                className="relative flex flex-col items-center justify-end flex-1 min-w-0 h-full group cursor-pointer"
                onClick={() => onHourSelect(price)}
                onMouseEnter={() => setHoveredPrice(price)}
                onMouseLeave={() => setHoveredPrice(null)}
                onTouchStart={() => setHoveredPrice(price)}
                onTouchEnd={() => setHoveredPrice(null)}
              >
                {/* Tooltip - posicionado debajo de la barra */}
                {isHovered && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in">
                    {/* Flecha del tooltip - arriba */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-1.5">
                      <div className="w-3 h-3 bg-neutral-900 transform rotate-45" />
                    </div>
                    <div className="bg-neutral-900 text-white px-3 py-2 rounded-lg shadow-lg text-center whitespace-nowrap">
                      <p className="text-caption font-medium">
                        {formatHour(price.hour)} - {formatHour(price.hour + 1)}
                      </p>
                      <p className="text-body font-bold">
                        {formatPrice(price.price)}€/kWh
                      </p>
                      <p className={cn(
                        'text-caption font-medium',
                        category.type === 'cheap' && 'text-green-400',
                        category.type === 'normal' && 'text-amber-400',
                        category.type === 'expensive' && 'text-red-400'
                      )}>
                        {category.label}
                      </p>
                    </div>
                  </div>
                )}

                {/* Barra */}
                <div
                  className={cn(
                    'w-full rounded-t-sm sm:rounded-t-md transition-all duration-200',
                    'relative',
                    isCurrent && 'ring-1 sm:ring-2 ring-primary-500',
                    isHovered && 'brightness-110'
                  )}
                  style={{
                    height: `${height}%`,
                    background: getBarGradient(price.price),
                    boxShadow: isHovered ? getBarShadow(price.price) : 'none',
                    minHeight: '8px'
                  }}
                >
                  {/* Indicador de hora actual */}
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shadow-md animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Etiqueta de hora - cada 3 horas en móvil, cada 2 en desktop */}
                <span className={cn(
                  'text-[10px] sm:text-caption mt-0.5 sm:mt-1.5 font-bold transition-colors',
                  // Móvil: cada 3 horas (0, 3, 6, 9, 12, 15, 18, 21). Desktop: cada 2 horas
                  price.hour % 3 === 0 ? 'text-neutral-600' : 'text-transparent',
                  price.hour % 2 === 0 && 'sm:text-neutral-500',
                  'group-hover:text-neutral-700'
                )}>
                  {price.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex justify-center gap-6 mb-4 text-caption">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'linear-gradient(to top, #059669, #10B981)' }}
          />
          <span className="text-neutral-600 font-medium">Barato</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'linear-gradient(to top, #D97706, #F59E0B)' }}
          />
          <span className="text-neutral-600 font-medium">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'linear-gradient(to top, #DC2626, #EF4444)' }}
          />
          <span className="text-neutral-600 font-medium">Caro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-primary-500 bg-primary-50" />
          <span className="text-neutral-600 font-medium">Ahora</span>
        </div>
      </div>

      {/* Indicadores de min/max */}
      <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
        <div className="text-center flex-1">
          <p className="text-caption text-neutral-500 mb-0.5">Mínimo</p>
          <p className="text-body font-bold text-semantic-success">
            {formatPrice(stats.min)}€
          </p>
        </div>
        <div className="h-8 w-px bg-neutral-200" />
        <div className="text-center flex-1">
          <p className="text-caption text-neutral-500 mb-0.5">Promedio</p>
          <p className="text-body font-bold text-neutral-700">
            {formatPrice(stats.average)}€
          </p>
        </div>
        <div className="h-8 w-px bg-neutral-200" />
        <div className="text-center flex-1">
          <p className="text-caption text-neutral-500 mb-0.5">Máximo</p>
          <p className="text-body font-bold text-semantic-danger">
            {formatPrice(stats.max)}€
          </p>
        </div>
      </div>
    </div>
  );
}
