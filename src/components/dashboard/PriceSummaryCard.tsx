import React from 'react';
import { BarChart3, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { HourlyPriceData, formatPrice } from '@/types/api';
import { reeApiService } from '@/services/reeApi';
import { cn } from '@/lib/utils';

interface PriceSummaryCardProps {
  prices: HourlyPriceData[];
  selectedDate: 'today' | 'tomorrow';
}

export function PriceSummaryCard({ prices, selectedDate }: PriceSummaryCardProps) {
  if (prices.length === 0) return null;

  const stats = reeApiService.calculatePriceStats(prices);
  
  // Calcular diferencias
  const difference = stats.max - stats.min;
  const aboveAverageCount = prices.filter(p => p.price > stats.average).length;
  const belowAverageCount = prices.filter(p => p.price < stats.average).length;
  
  // Determinar si es caro o barato el día
  const getDaySummary = () => {
    if (selectedDate === 'today') {
      const now = new Date();
      const currentHour = now.getHours();
      const remainingHours = prices.filter(p => p.hour >= currentHour);
      
      if (remainingHours.length > 0) {
        const upcomingAvg = remainingHours.reduce((sum, p) => sum + p.price, 0) / remainingHours.length;
        if (upcomingAvg < stats.average) {
          return 'Las horas que quedan hoy son más baratas que la media. Es un buen momento para usar electrodomésticos.';
        } else if (upcomingAvg > stats.average * 1.1) {
          return 'Las horas restantes del día son más caras de lo normal. Evita usar electrodomésticos de alto consumo.';
        }
      }
    }
    
    return 'Hoy es un día con precios dentro de los valores habituales.';
  };

  const getTimeContext = () => {
    const cheapestHour = prices.find(p => p.price === stats.min);
    const expensiveHour = prices.find(p => p.price === stats.max);
    
    return {
      cheapest: cheapestHour ? cheapestHour.hour : 0,
      expensive: expensiveHour ? expensiveHour.hour : 0,
    };
  };

  const timeContext = getTimeContext();

  return (
    <div className="card-base p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <BarChart3 size={20} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-subtitle font-semibold text-foreground">
            Resumen del día
          </h2>
          <p className="text-body-sm text-neutral-500">
            Análisis completo de precios
          </p>
        </div>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-semantic-success-bg rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown size={16} className="text-semantic-success" />
          </div>
          <div className="text-title font-bold text-semantic-success mb-1">
            {formatPrice(stats.min)}
          </div>
          <div className="text-caption text-neutral-600">Precio mínimo</div>
          <div className="text-caption text-semantic-success">
            {timeContext.cheapest.toString().padStart(2, '0')}:00
          </div>
        </div>
        
        <div className="text-center p-3 bg-semantic-danger-bg rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp size={16} className="text-semantic-danger" />
          </div>
          <div className="text-title font-bold text-semantic-danger mb-1">
            {formatPrice(stats.max)}
          </div>
          <div className="text-caption text-neutral-600">Precio máximo</div>
          <div className="text-caption text-semantic-danger">
            {timeContext.expensive.toString().padStart(2, '0')}:00
          </div>
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-neutral-200">
          <span className="text-body-sm text-neutral-600">Precio medio</span>
          <span className="text-body-sm font-medium text-foreground">
            {formatPrice(stats.average)} €/kWh
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-neutral-200">
          <span className="text-body-sm text-neutral-600">Rango de precios</span>
          <span className="text-body-sm font-medium text-foreground">
            {formatPrice(difference)} € de diferencia
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-neutral-200">
          <span className="text-body-sm text-neutral-600">Horas caras</span>
          <span className="text-body-sm font-medium text-semantic-danger">
            {aboveAverageCount} de 24 horas
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-body-sm text-neutral-600">Horas baratas</span>
          <span className="text-body-sm font-medium text-semantic-success">
            {belowAverageCount} de 24 horas
          </span>
        </div>
      </div>
      
      {/* Mensaje en lenguaje natural */}
      <div className="bg-neutral-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-neutral-600 mt-0.5 flex-shrink-0" />
          <p className="text-body-sm text-neutral-700">
            {getDaySummary()}
          </p>
        </div>
      </div>
      
      {/* Consejos de optimización */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <h4 className="text-body-sm font-semibold text-primary-800 mb-2">
          Consejos de ahorro
        </h4>
        <ul className="text-caption text-primary-700 space-y-1">
          <li>• Usa electrodomésticos entre {timeContext.cheapest.toString().padStart(2, '0')}:00 y {(timeContext.cheapest + 3).toString().padStart(2, '0')}:00</li>
          <li>• Evita usar equipos de alto consumo entre {timeContext.expensive.toString().padStart(2, '0')}:00 y {(timeContext.expensive + 2).toString().padStart(2, '0')}:00</li>
          <li>• Programa lavavajillas y lavadora para horas nocturnas</li>
        </ul>
      </div>
    </div>
  );
}
