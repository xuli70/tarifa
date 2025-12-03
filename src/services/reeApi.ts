import { 
  REEApiResponse, 
  HourlyPriceData, 
  PriceStats, 
  API_CONFIG,
  convertMWhToKWh,
  getPriceCategory,
  formatDateTime 
} from '../types/api';

/**
 * Servicio para interactuar con la API pública de REE (Red Eléctrica de España)
 * Endpoint: precios-mercados-tiempo-real con granularidad horaria
 */

class REEApiService {
  private cache = new Map<string, { data: HourlyPriceData[]; timestamp: number }>();
  private readonly cacheTTL = API_CONFIG.CACHE_TTL;

  /**
   * Obtiene los precios horarios desde la API de REE
   * @param date - Fecha para la cual obtener los precios
   * @returns Array de datos horarios
   */
  async getHourlyPrices(date: Date): Promise<HourlyPriceData[]> {
    const dateKey = this.getDateKey(date);
    
    // Verificar caché
    const cached = this.cache.get(dateKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Construir parámetros de consulta
      const startDate = this.formatDateForAPI(date);
      const endDate = this.formatDateEndForAPI(date);
      
      const url = `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINT}`;
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        time_trunc: 'hour',
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PreciosElectricidad-Espana/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: REEApiResponse = await response.json();
      
      // Procesar respuesta
      const hourlyData = this.processApiResponse(data, date);
      
      // Guardar en caché
      this.cache.set(dateKey, {
        data: hourlyData,
        timestamp: Date.now(),
      });

      return hourlyData;

    } catch (error) {
      console.error('Error fetching prices from REE API:', error);
      
      // Si hay error, intentar usar datos de caché (aunque estén expirados)
      const expired = this.cache.get(dateKey);
      if (expired) {
        console.warn('Using expired cache data due to API error');
        return expired.data;
      }
      
      throw new Error(`No se pudieron obtener los precios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene precios para el día actual y el siguiente
   */
  async getTodayAndTomorrowPrices(): Promise<{
    today: HourlyPriceData[];
    tomorrow: HourlyPriceData[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    try {
      const [todayData, tomorrowData] = await Promise.all([
        this.getHourlyPrices(today),
        this.getHourlyPrices(tomorrow),
      ]);

      // Marcar qué datos son de hoy y cuáles de mañana
      const todayWithFlag = todayData.map(price => ({
        ...price,
        isTomorrow: false,
      }));

      const tomorrowWithFlag = tomorrowData.map(price => ({
        ...price,
        isTomorrow: true,
      }));

      return {
        today: todayWithFlag,
        tomorrow: tomorrowWithFlag,
      };
    } catch (error) {
      console.error('Error fetching today and tomorrow prices:', error);
      
      // Si falla, al menos intentar obtener los datos de hoy
      try {
        const todayData = await this.getHourlyPrices(today);
        return {
          today: todayData.map(price => ({ ...price, isTomorrow: false })),
          tomorrow: [], // Mañana sin datos
        };
      } catch (todayError) {
        throw error; // Lanzar el error original
      }
    }
  }

  /**
   * Procesa la respuesta de la API y la convierte en datos horarios
   */
  private processApiResponse(response: REEApiResponse, date: Date): HourlyPriceData[] {
    if (response.errors && response.errors.length > 0) {
      throw new Error(`API returned errors: ${response.errors.map(e => e.detail).join(', ')}`);
    }

    if (!response.included || response.included.length === 0) {
      throw new Error('No price data found in API response');
    }

    // Obtener la serie de precios (buscar la que contiene "PVPC" o "price")
    const priceSeries = response.included.find(series => 
      series.attributes.magnitude?.toLowerCase().includes('price') ||
      series.attributes.title?.toLowerCase().includes('pvpc') ||
      series.attributes.title?.toLowerCase().includes('precio')
    );

    if (!priceSeries) {
      throw new Error('No price series found in API response');
    }

    const prices = priceSeries.attributes.values || [];
    if (prices.length === 0) {
      throw new Error('No price values found in series');
    }

    // Convertir datos y normalizar
    const hourlyData = prices.map((pricePoint, index) => {
      const dateTime = new Date(pricePoint.datetime);
      const priceKwh = convertMWhToKWh(pricePoint.value);
      
      return {
        timestamp: dateTime,
        price: priceKwh,
        priceMwh: pricePoint.value,
        hour: index,
        isCurrent: this.isCurrentHour(dateTime),
        isTomorrow: false, // Se marcará después
      };
    });

    return this.normalizeHourlyData(hourlyData, date);
  }

  /**
   * Normaliza los datos horarios para asegurar 24 horas
   */
  private normalizeHourlyData(data: HourlyPriceData[], targetDate: Date): HourlyPriceData[] {
    const normalized: HourlyPriceData[] = [];
    
    // Asegurar que tenemos 24 horas (0-23)
    for (let hour = 0; hour < 24; hour++) {
      let priceData = data.find(d => d.hour === hour);
      
      if (!priceData) {
        // Si no hay datos para esta hora, usar interpolación simple o valor por defecto
        priceData = {
          timestamp: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour),
          price: data.length > 0 ? data[0].price : 0, // Usar primer precio disponible como fallback
          priceMwh: data.length > 0 ? data[0].priceMwh : 0,
          hour,
          isCurrent: this.isCurrentHour(new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour)),
          isTomorrow: false,
        };
      }
      
      normalized.push(priceData);
    }

    return normalized;
  }

  /**
   * Calcula estadísticas de precios
   */
  calculatePriceStats(prices: HourlyPriceData[]): PriceStats {
    if (prices.length === 0) {
      throw new Error('Cannot calculate stats from empty price data');
    }

    const priceValues = prices.map(p => p.price);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const average = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;

    // Encontrar precio actual
    const currentHour = new Date().getHours();
    const currentPrice = prices.find(p => p.hour === currentHour) || prices[0];
    
    // Calcular percentil actual
    const percentile = ((currentPrice.price - min) / (max - min)) * 100;

    return {
      min,
      max,
      average,
      current: currentPrice.price,
      percentile,
    };
  }

  /**
   * Obtiene las mejores horas para consumir (más baratas)
   */
  getBestHours(prices: HourlyPriceData[], count: number = 3): HourlyPriceData[] {
    return [...prices]
      .sort((a, b) => a.price - b.price)
      .slice(0, count);
  }

  /**
   * Obtiene las peores horas para consumir (más caras)
   */
  getWorstHours(prices: HourlyPriceData[], count: number = 3): HourlyPriceData[] {
    return [...prices]
      .sort((a, b) => b.price - a.price)
      .slice(0, count);
  }

  // Métodos auxiliares privados

  private formatDateForAPI(date: Date): string {
    // Formato: YYYY-MM-DDTHH:MM
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T00:00`;
  }

  private formatDateEndForAPI(date: Date): string {
    // Formato: YYYY-MM-DDTHH:MM
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T23:59`;
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }

  private isCurrentHour(date: Date): boolean {
    const now = new Date();
    const targetHour = date.getHours();
    const currentHour = now.getHours();
    
    return targetHour === currentHour;
  }

  /**
   * Limpia el caché de datos antiguos
   */
  cleanCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheTTL) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instancia singleton del servicio
export const reeApiService = new REEApiService();

// Función de utilidad para obtener resumen de precios
export async function getPriceSummary(date: Date = new Date()) {
  try {
    const prices = await reeApiService.getHourlyPrices(date);
    const stats = reeApiService.calculatePriceStats(prices);
    const bestHours = reeApiService.getBestHours(prices);
    const worstHours = reeApiService.getWorstHours(prices);
    
    return {
      prices,
      stats,
      bestHours,
      worstHours,
      lastUpdated: new Date(),
    };
  } catch (error) {
    throw new Error(`Error getting price summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
