import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { HourlyPriceData, getPriceCategory, formatPrice } from '@/types/api';
import { reeApiService } from '@/services/reeApi';
import { cn } from '@/lib/utils';

interface CurrentPriceCardProps {
  prices: HourlyPriceData[];
  lastUpdated: Date | null;
}

export function CurrentPriceCard({ prices, lastUpdated }: CurrentPriceCardProps) {
  // Encontrar precio actual
  const now = new Date();
  const currentHour = now.getHours();
  const currentPrice = prices.find(p => p.hour === currentHour);
  
  // Si no hay precio para la hora actual, usar el siguiente disponible
  const displayPrice = currentPrice || prices.find(p => p.hour > currentHour) || prices[0];
  
  // Calcular estadísticas para determinar la categoría
  const stats = reeApiService.calculatePriceStats(prices);
  const category = getPriceCategory(displayPrice.price, stats);
  
  // Determinar tendencia (comparar con precio anterior)
  const currentIndex = prices.findIndex(p => p.hour === displayPrice.hour);
  const previousPrice = currentIndex > 0 ? prices[currentIndex - 1] : null;
  const trend = previousPrice ? displayPrice.price - previousPrice.price : 0;
  const trendIcon = trend > 0 ? TrendingUp : TrendingDown;
  const TrendIcon = trendIcon;
  
  // Formato de fecha
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Nunca';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (diff < 1) return 'Ahora mismo';
    if (diff < 60) return `Hace ${diff} min`;
    const hours = Math.floor(diff / 60);
    return `Hace ${hours}h`;
  };

  return (
    <div className="card-base p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-body-sm text-neutral-500 mb-1">Precio ahora</p>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-hero font-bold tracking-tight',
              category.type === 'cheap' && 'text-semantic-success',
              category.type === 'normal' && 'text-semantic-warning',
              category.type === 'expensive' && 'text-semantic-danger'
            )}>
              {formatPrice(displayPrice.price)}
            </span>
            <span className="text-body text-neutral-700">€/kWh</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            'px-3 py-1 rounded-full text-caption font-medium',
            category.type === 'cheap' && 'bg-semantic-success-bg text-semantic-success',
            category.type === 'normal' && 'bg-semantic-warning-bg text-semantic-warning',
            category.type === 'expensive' && 'bg-semantic-danger-bg text-semantic-danger'
          )}>
            {category.label}
          </div>
          
          {trend !== 0 && (
            <div className={cn(
              'flex items-center gap-1 text-caption',
              trend > 0 ? 'text-semantic-danger' : 'text-semantic-success'
            )}>
              <TrendIcon size={12} />
              <span>{trend > 0 ? '+' : ''}{formatPrice(trend, 4)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-caption text-neutral-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{displayPrice.timestamp.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - {new Date(displayPrice.timestamp.getTime() + 60*60*1000).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
        
        <span>Actualizado: {formatLastUpdated(lastUpdated)}</span>
      </div>
      
      {/* Barra de progreso visual que muestra la posición del precio actual */}
      <div className="mt-4">
        <div className="flex justify-between text-caption text-neutral-500 mb-2">
          <span>Min: {formatPrice(stats.min)}€</span>
          <span>Media: {formatPrice(stats.average)}€</span>
          <span>Máx: {formatPrice(stats.max)}€</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-semantic-success via-semantic-warning to-semantic-danger relative"
            style={{ width: '100%' }}
          >
            <div 
              className={cn(
                'absolute top-0 w-1 h-full bg-foreground shadow-sm rounded-full',
                category.type === 'cheap' && 'bg-semantic-success',
                category.type === 'normal' && 'bg-semantic-warning',
                category.type === 'expensive' && 'bg-semantic-danger'
              )}
              style={{ 
                left: `${((displayPrice.price - stats.min) / (stats.max - stats.min)) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
