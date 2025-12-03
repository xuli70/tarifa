import React from 'react';
import { OptimizedSchedule, Appliance, HourlyPriceData, getPriceCategory } from '@/types/api';
import { reeApiService } from '@/services/reeApi';
import { formatPrice } from '@/types/api';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizationTimelineProps {
  schedules: OptimizedSchedule[];
  appliances: Appliance[];
  prices: HourlyPriceData[];
}

export function OptimizationTimeline({ 
  schedules, 
  appliances, 
  prices 
}: OptimizationTimelineProps) {
  const stats = reeApiService.calculatePriceStats(prices);
  
  // Generar timeline de 24 horas
  const timeline = Array.from({ length: 24 }, (_, hour) => {
    const price = prices.find(p => p.hour === hour);
    const activeSchedules = schedules.filter(schedule => {
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      
      if (startHour <= endHour) {
        return hour >= startHour && hour < endHour;
      } else {
        // Rango que cruza medianoche
        return hour >= startHour || hour < endHour;
      }
    });
    
    return {
      hour,
      price: price?.price || 0,
      schedules: activeSchedules,
      isCurrent: hour === new Date().getHours(),
    };
  });

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Clock size={20} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-subtitle font-semibold text-foreground">
            Cronograma optimizado
          </h2>
          <p className="text-body-sm text-neutral-500">
            Horarios recomendados para cada electrodoméstico
          </p>
        </div>
      </div>

      {/* Timeline horizontal */}
      <div className="relative">
        {/* Eje de horas */}
        <div className="flex justify-between mb-2 px-2">
          {Array.from({ length: 24 }, (_, i) => (
            <span 
              key={i}
              className={cn(
                'text-caption',
                i % 6 === 0 ? 'text-neutral-600' : 'text-transparent'
              )}
            >
              {i % 6 === 0 ? `${i.toString().padStart(2, '0')}:00` : ''}
            </span>
          ))}
        </div>

        {/* Línea de tiempo */}
        <div className="relative h-16 mb-4">
          <div className="absolute inset-0 bg-neutral-200 rounded-full" />
          
          {/* Barras de electrodomésticos */}
          {schedules.map((schedule) => {
            const appliance = appliances.find(a => a.id === schedule.applianceId);
            if (!appliance) return null;
            
            const startHour = parseInt(schedule.startTime.split(':')[0]);
            const endHour = parseInt(schedule.endTime.split(':')[0]);
            
            const startPercent = (startHour / 24) * 100;
            const durationPercent = ((endHour - startHour + 24) % 24 / 24) * 100;
            
            return (
              <div
                key={schedule.applianceId}
                className="absolute h-4 rounded-full cursor-pointer group"
                style={{
                  left: `${startPercent}%`,
                  width: `${durationPercent}%`,
                  backgroundColor: getApplianceColor(schedule.applianceId),
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                title={`${appliance.name}: ${schedule.startTime} - ${schedule.endTime}`}
              >
                {/* Tooltip en hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-caption rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {appliance.name}<br />
                  {schedule.startTime} - {schedule.endTime}<br />
                  {formatPrice(schedule.estimatedCost)}€
                </div>
              </div>
            );
          })}
        </div>

        {/* Lista detallada por hora */}
        <div className="space-y-2">
          {timeline.map((hourData) => {
            const category = getPriceCategory(hourData.price, stats);
            
            return (
              <HourRow
                key={hourData.hour}
                hour={hourData.hour}
                price={hourData.price}
                category={category}
                schedules={hourData.schedules}
                appliances={appliances}
                isCurrent={hourData.isCurrent}
              />
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <h4 className="text-body-sm font-medium text-foreground mb-3">
          Aparatos configurados
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {appliances.map((appliance) => {
            const schedule = schedules.find(s => s.applianceId === appliance.id);
            return (
              <div key={appliance.id} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getApplianceColor(appliance.id) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-medium text-foreground truncate">
                    {appliance.name}
                  </div>
                  {schedule && (
                    <div className="text-caption text-neutral-500">
                      {schedule.startTime} - {schedule.endTime} • {formatPrice(schedule.estimatedCost)}€
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface HourRowProps {
  hour: number;
  price: number;
  category: any;
  schedules: OptimizedSchedule[];
  appliances: Appliance[];
  isCurrent: boolean;
}

function HourRow({ 
  hour, 
  price, 
  category, 
  schedules, 
  appliances, 
  isCurrent 
}: HourRowProps) {
  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  return (
    <div className={cn(
      'flex items-center gap-4 p-2 rounded-lg transition-colors',
      isCurrent && 'bg-primary-100',
      schedules.length > 0 && 'bg-neutral-50'
    )}>
      {/* Hora */}
      <div className="w-12 text-caption text-neutral-600 font-medium">
        {formatHour(hour)}
      </div>

      {/* Precio */}
      <div className="w-20">
        <div className={cn(
          'text-body font-semibold',
          category.type === 'cheap' && 'text-semantic-success',
          category.type === 'normal' && 'text-semantic-warning',
          category.type === 'expensive' && 'text-semantic-danger'
        )}>
          {formatPrice(price)}€
        </div>
        <div className="text-caption text-neutral-500">
          {category.label}
        </div>
      </div>

      {/* Electrodomésticos activos */}
      <div className="flex-1 min-w-0">
        {schedules.length > 0 ? (
          <div className="space-y-1">
            {schedules.map((schedule) => {
              const appliance = appliances.find(a => a.id === schedule.applianceId);
              if (!appliance) return null;
              
              return (
                <div 
                  key={schedule.applianceId}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getApplianceColor(schedule.applianceId) }}
                  />
                  <div className="text-body-sm text-foreground truncate">
                    {appliance.name}
                  </div>
                  <div className="text-caption text-neutral-500">
                    ({schedule.duration}h)
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-body-sm text-neutral-500">
            Sin electrodomésticos programados
          </div>
        )}
      </div>

      {/* Indicador de hora actual */}
      {isCurrent && (
        <div className="w-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Función para generar colores únicos para cada electrodoméstico
function getApplianceColor(applianceId: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
  ];
  
  // Generar índice basado en el ID
  const hash = applianceId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
