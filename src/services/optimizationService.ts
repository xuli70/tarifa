import { 
  Appliance, 
  HourlyPriceData, 
  OptimizedSchedule, 
  OptimizationResult, 
  TimeRestriction,
  formatHour 
} from '../types/api';

/**
 * Servicio de optimización para calcular horarios óptimos de electrodomésticos
 * basado en precios de electricidad por horas
 */

class OptimizationService {
  
  /**
   * Optimiza el uso de electrodomésticos basado en los precios horarios
   */
  optimizeAppliances(
    appliances: Appliance[], 
    prices: HourlyPriceData[]
  ): OptimizationResult {
    if (appliances.length === 0) {
      return {
        schedules: [],
        totalSavings: 0,
        baselineCost: 0,
        optimizedCost: 0,
        savingsPercentage: 0,
        appliances: [],
      };
    }

    // Calcular costo base (usar horas más caras)
    const baselineResult = this.calculateBaselineCost(appliances, prices);
    
    // Aplicar algoritmo de optimización
    const optimizedSchedules = this.optimizeSchedule(appliances, prices);
    
    // Calcular costos
    const optimizedCost = optimizedSchedules.reduce(
      (total, schedule) => total + schedule.estimatedCost, 0
    );
    
    const totalSavings = baselineResult - optimizedCost;
    const savingsPercentage = baselineResult > 0 
      ? (totalSavings / baselineResult) * 100 
      : 0;

    return {
      schedules: optimizedSchedules,
      totalSavings,
      baselineCost: baselineResult,
      optimizedCost,
      savingsPercentage,
      appliances: appliances.map(app => ({
        ...app,
        optimized: true,
        suggestedSchedule: optimizedSchedules.find(s => s.applianceId === app.id),
      })),
    };
  }

  /**
   * Algoritmo principal de optimización
   * Ordena las horas por precio y asigna electrodomésticos a las mejores horas
   */
  private optimizeSchedule(
    appliances: Appliance[], 
    prices: HourlyPriceData[]
  ): OptimizedSchedule[] {
    // Ordenar horas por precio (más baratas primero)
    const sortedHours = [...prices].sort((a, b) => a.price - b.price);
    
    const schedules: OptimizedSchedule[] = [];
    const usedHours = new Set<number>(); // Horas ya utilizadas
    
    // Ordenar electrodomésticos por prioridad
    const sortedAppliances = [...appliances].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const appliance of sortedAppliances) {
      const schedule = this.findBestTimeSlot(appliance, sortedHours, usedHours);
      if (schedule) {
        schedules.push(schedule);
        
        // Marcar horas como utilizadas
        for (let i = 0; i < Math.ceil(appliance.duration); i++) {
          usedHours.add(parseInt(schedule.startTime.split(':')[0]));
        }
      }
    }

    return schedules;
  }

  /**
   * Encuentra el mejor horario para un electrodoméstico específico
   */
  private findBestTimeSlot(
    appliance: Appliance,
    sortedHours: HourlyPriceData[],
    usedHours: Set<number>
  ): OptimizedSchedule | null {
    
    // Filtrar horas disponibles considerando restricciones y horas ocupadas
    const availableHours = sortedHours.filter(hour => {
      // Verificar que la hora no esté ocupada
      if (usedHours.has(hour.hour)) return false;
      
      // Verificar restricciones de horario
      if (!this.isWithinRestrictions(hour, appliance.restrictions || [])) return false;
      
      return true;
    });

    if (availableHours.length === 0) {
      // Si no hay horas disponibles con restricciones, usar la mejor disponible
      const fallbackHours = sortedHours.filter(hour => !usedHours.has(hour.hour));
      if (fallbackHours.length === 0) return null;
      
      return this.createSchedule(appliance, fallbackHours[0]);
    }

    // Buscar bloque连续 de horas consecutivas
    const consecutiveBlock = this.findConsecutiveHours(
      availableHours, 
      appliance.duration
    );

    if (consecutiveBlock.length > 0) {
      const startHour = consecutiveBlock[0];
      const cost = this.calculateScheduleCost(appliance, consecutiveBlock);
      
      return {
        applianceId: appliance.id,
        startTime: formatHour(startHour.hour),
        endTime: formatHour((startHour.hour + appliance.duration) % 24),
        duration: appliance.duration,
        estimatedCost: cost,
        savings: 0, // Se calculará después
        price: startHour.price,
      };
    }

    // Si no hay bloque continuo, usar la mejor hora disponible
    const bestHour = availableHours[0];
    return this.createSchedule(appliance, bestHour);
  }

  /**
   * Encuentra un bloque de horas consecutivas
   */
  private findConsecutiveHours(
    availableHours: HourlyPriceData[], 
    duration: number
  ): HourlyPriceData[] {
    const hours = [...availableHours].sort((a, b) => a.hour - b.hour);
    
    for (let i = 0; i <= hours.length - duration; i++) {
      const block = hours.slice(i, i + duration);
      
      // Verificar si las horas son consecutivas
      let consecutive = true;
      for (let j = 1; j < block.length; j++) {
        if (block[j].hour !== block[j-1].hour + 1) {
          consecutive = false;
          break;
        }
      }
      
      if (consecutive) {
        return block;
      }
    }
    
    return []; // No se encontró bloque consecutivo
  }

  /**
   * Verifica si una hora está dentro de las restricciones
   */
  private isWithinRestrictions(
    hour: HourlyPriceData, 
    restrictions: TimeRestriction[]
  ): boolean {
    const hourStr = formatHour(hour.hour);
    
    for (const restriction of restrictions) {
      if (restriction.type === 'forbidden') {
        if (this.isTimeInRange(hourStr, restriction.start, restriction.end)) {
          return false;
        }
      }
      // Para restricciones 'preferred', simplemente las preferimos pero no las obligamos
    }
    
    return true;
  }

  /**
   * Verifica si una hora está dentro de un rango
   */
  private isTimeInRange(time: string, start: string, end: string): boolean {
    const timeNum = parseInt(time.split(':')[0]);
    const startNum = parseInt(start.split(':')[0]);
    const endNum = parseInt(end.split(':')[0]);
    
    if (startNum <= endNum) {
      // Mismo día
      return timeNum >= startNum && timeNum < endNum;
    } else {
      // Rango que cruza medianoche
      return timeNum >= startNum || timeNum < endNum;
    }
  }

  /**
   * Crea un schedule para un electrodoméstico
   */
  private createSchedule(
    appliance: Appliance,
    startHour: HourlyPriceData
  ): OptimizedSchedule {
    const cost = this.calculateScheduleCost(appliance, [startHour]);
    
    return {
      applianceId: appliance.id,
      startTime: formatHour(startHour.hour),
      endTime: formatHour((startHour.hour + appliance.duration) % 24),
      duration: appliance.duration,
      estimatedCost: cost,
      savings: 0, // Se calculará después
      price: startHour.price,
    };
  }

  /**
   * Calcula el costo de un schedule
   */
  private calculateScheduleCost(
    appliance: Appliance, 
    hours: HourlyPriceData[]
  ): number {
    const totalKWh = (appliance.power * appliance.duration) / 1000;
    
    // Si tenemos múltiples horas, calcular costo promedio ponderado
    if (hours.length === appliance.duration) {
      const totalCost = hours.reduce((sum, hour) => {
        const hourKWh = (appliance.power) / 1000; // 1 hora de consumo
        return sum + (hourKWh * hour.price);
      }, 0);
      return totalCost;
    }
    
    // Si solo tenemos una hora de referencia
    return totalKWh * hours[0].price;
  }

  /**
   * Calcula el costo baseline (peor caso - usar horas más caras)
   */
  private calculateBaselineCost(
    appliances: Appliance[], 
    prices: HourlyPriceData[]
  ): number {
    const worstHours = [...prices].sort((a, b) => b.price - a.price);
    
    return appliances.reduce((total, appliance) => {
      const totalKWh = (appliance.power * appliance.duration) / 1000;
      const worstPrice = worstHours[0].price;
      return total + (totalKWh * worstPrice);
    }, 0);
  }

  /**
   * Obtiene recomendaciones específicas para un electrodoméstico
   */
  getRecommendationsForAppliance(
    appliance: Appliance, 
    prices: HourlyPriceData[]
  ): {
    bestTime: string;
    worstTime: string;
    potentialSavings: number;
    recommendation: string;
  } {
    if (prices.length === 0) {
      return {
        bestTime: 'No disponible',
        worstTime: 'No disponible', 
        potentialSavings: 0,
        recommendation: 'No hay datos de precios disponibles',
      };
    }

    const sortedHours = [...prices].sort((a, b) => a.price - b.price);
    const bestHour = sortedHours[0];
    const worstHour = sortedHours[sortedHours.length - 1];
    
    const totalKWh = (appliance.power * appliance.duration) / 1000;
    const potentialSavings = totalKWh * (worstHour.price - bestHour.price);
    
    let recommendation = '';
    if (potentialSavings > 0.50) {
      recommendation = `Usar entre ${formatHour(bestHour.hour)} y ${formatHour((bestHour.hour + appliance.duration) % 24)} puede ahorrarte ${potentialSavings.toFixed(2)}€.`;
    } else if (potentialSavings > 0.20) {
      recommendation = `Usar entre ${formatHour(bestHour.hour)} y ${formatHour((bestHour.hour + appliance.duration) % 24)} puede ahorrarte ${potentialSavings.toFixed(2)}€.`;
    } else {
      recommendation = 'El ahorro potencial es mínimo. Puedes usar el electrodoméstico en cualquier momento.';
    }

    return {
      bestTime: formatHour(bestHour.hour),
      worstTime: formatHour(worstHour.hour),
      potentialSavings,
      recommendation,
    };
  }

  /**
   * Simula un cronograma del día con los horarios optimizados
   */
  generateDayTimeline(
    schedules: OptimizedSchedule[], 
    appliances: Appliance[]
  ): Array<{
    hour: number;
    appliances: Appliance[];
    totalPower: number;
    totalCost: number;
  }> {
    const timeline = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      appliances: [] as Appliance[],
      totalPower: 0,
      totalCost: 0,
    }));

    schedules.forEach(schedule => {
      const appliance = appliances.find(a => a.id === schedule.applianceId);
      if (!appliance) return;

      const startHour = parseInt(schedule.startTime.split(':')[0]);
      
      // Añadir el electrodoméstico a las horas que estará en uso
      for (let i = 0; i < schedule.duration; i++) {
        const hourIndex = (startHour + i) % 24;
        timeline[hourIndex].appliances.push(appliance);
        timeline[hourIndex].totalPower += appliance.power;
      }
    });

    return timeline;
  }

  /**
   * Valida un electrodoméstico
   */
  validateAppliance(appliance: Appliance): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!appliance.name.trim()) {
      errors.push('El nombre es obligatorio');
    }
    
    if (appliance.power <= 0) {
      errors.push('La potencia debe ser mayor que 0');
    }
    
    if (appliance.power > 10000) {
      errors.push('La potencia no puede ser mayor a 10,000W');
    }
    
    if (appliance.duration <= 0) {
      errors.push('La duración debe ser mayor que 0');
    }
    
    if (appliance.duration > 24) {
      errors.push('La duración no puede ser mayor a 24 horas');
    }
    
    if (appliance.startTime && appliance.endTime) {
      if (!this.isTimeValid(appliance.startTime) || !this.isTimeValid(appliance.endTime)) {
        errors.push('Formato de hora inválido (debe ser HH:MM)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isTimeValid(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}

// Instancia singleton del servicio
export const optimizationService = new OptimizationService();
