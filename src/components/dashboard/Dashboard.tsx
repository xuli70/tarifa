import React, { useState } from 'react';
import { CurrentPriceCard } from './CurrentPriceCard';
import { PriceChart } from './PriceChart';
import { TopHoursCard } from './TopHoursCard';
import { PriceSummaryCard } from './PriceSummaryCard';
import { PriceDetailModal } from './PriceDetailModal';
import { useApp } from '@/hooks/useAppState';
import { HourlyPriceData } from '@/types/api';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function Dashboard() {
  const { state, actions } = useApp();
  const { prices, loading, error, lastUpdated, currentDate } = state;
  const [selectedPrice, setSelectedPrice] = useState<HourlyPriceData | null>(null);

  // Determinar fecha seleccionada basada en el estado global
  const getSelectedDateType = (): 'today' | 'tomorrow' => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (currentDate.toDateString() === today.toDateString()) {
      return 'today';
    } else if (currentDate.toDateString() === tomorrow.toDateString()) {
      return 'tomorrow';
    }
    return 'today';
  };

  const selectedDate = getSelectedDateType();

  // Filtrar precios por fecha seleccionada
  const filteredPrices = prices.filter(p => 
    selectedDate === 'today' ? !p.isTomorrow : p.isTomorrow
  );

  // Filtrar solo precios de hoy para estadísticas
  const todayPrices = prices.filter(p => !p.isTomorrow);

  // Verificar si tenemos datos de mañana
  const tomorrowPrices = prices.filter(p => p.isTomorrow);
  const hasTomorrowData = tomorrowPrices.length > 0;

  // Manejar selección de hora en el gráfico
  const handleHourSelect = (price: HourlyPriceData) => {
    setSelectedPrice(price);
  };

  // Cerrar modal de detalle
  const handleCloseDetail = () => {
    setSelectedPrice(null);
  };

  if (loading && prices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner message="Cargando precios..." />
      </div>
    );
  }

  if (error && prices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorMessage 
          message={error} 
          onRetry={actions.retry}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Mensaje informativo sobre datos de mañana */}
      {selectedDate === 'tomorrow' && !hasTomorrowData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-body-sm text-amber-700">
            <strong>Los precios de mañana se publican a las 20:15.</strong> Los datos aparecerán automáticamente una vez disponibles.
          </p>
          {loading && (
            <p className="text-body-sm text-amber-600 mt-1">
              Cargando datos de mañana...
            </p>
          )}
        </div>
      )}

      {/* Precio actual destacado */}
      {todayPrices.length > 0 && (
        <CurrentPriceCard 
          prices={todayPrices}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Gráfico de precios horarios */}
      {filteredPrices.length > 0 && (
        <PriceChart 
          prices={filteredPrices}
          onHourSelect={handleHourSelect}
        />
      )}

      {/* Top 3 horas más baratas */}
      {filteredPrices.length > 0 && (
        <TopHoursCard
          prices={filteredPrices}
          type="cheapest"
          title="Mejores horas para consumir"
        />
      )}

      {/* Top 3 horas más caras */}
      {filteredPrices.length > 0 && (
        <TopHoursCard
          prices={filteredPrices}
          type="expensive"
          title="Horas más caras"
        />
      )}

      {/* Resumen del día */}
      {todayPrices.length > 0 && (
        <PriceSummaryCard 
          prices={todayPrices}
          selectedDate={selectedDate}
        />
      )}

      {/* Modal de detalle de precio */}
      {selectedPrice && (
        <PriceDetailModal
          price={selectedPrice}
          allPrices={todayPrices}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
