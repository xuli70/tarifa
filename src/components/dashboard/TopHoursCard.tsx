import React from 'react';
import { HourlyPriceData, formatPrice } from '@/types/api';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopHoursCardProps {
  prices: HourlyPriceData[];
  type: 'cheapest' | 'expensive';
  title: string;
  onHourSelect?: (price: HourlyPriceData) => void;
}

export function TopHoursCard({ prices, type, title, onHourSelect }: TopHoursCardProps) {
  // Obtener top 3 horas según el tipo
  const topHours = [...prices]
    .sort((a, b) => type === 'cheapest' ? a.price - b.price : b.price - a.price)
    .slice(0, 3);

  const getRankingIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '';
    }
  };

  const getPriceColor = (price: number) => {
    if (type === 'cheapest') {
      return 'text-semantic-success';
    }
    return 'text-semantic-danger';
  };

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  const handleHourClick = (price: HourlyPriceData) => {
    if (onHourSelect) {
      onHourSelect(price);
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-subtitle font-semibold text-foreground mb-3">
        {title}
      </h3>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {topHours.map((price, index) => (
          <div
            key={price.hour}
            onClick={() => handleHourClick(price)}
            className={cn(
              'flex-shrink-0 card-interactive p-4 min-w-[140px] text-center cursor-pointer',
              onHourSelect && 'hover:scale-105'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-caption text-neutral-500">
                {getRankingIcon(index)}
              </span>
              <span className="text-caption text-neutral-500">
                {formatHour(price.hour)}
              </span>
            </div>
            
            <div className={cn('text-title font-bold mb-1', getPriceColor(price.price))}>
              {formatPrice(price.price)}
            </div>
            
            <div className="text-caption text-neutral-500 mb-2">€/kWh</div>
            
            {price.isCurrent && (
              <div className="inline-block px-2 py-1 bg-primary-100 text-primary-600 text-caption font-medium rounded-full">
                Ahora
              </div>
            )}
            
            {onHourSelect && (
              <ChevronRight 
                size={16} 
                className="text-neutral-400 mt-2 mx-auto" 
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Mensaje informativo */}
      <div className="mt-3 p-3 bg-neutral-100 rounded-lg">
        <p className="text-body-sm text-neutral-600">
          {type === 'cheapest' 
            ? `Las ${topHours.length} horas más baratas para consumir energía. Ideal para electrodomésticos de alto consumo.`
            : `Las ${topHours.length} horas más caras del día. Evita usar electrodomésticos durante estas franjas.`
          }
        </p>
      </div>
    </div>
  );
}
