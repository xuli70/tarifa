// Tipos para la API REE y datos de la aplicación

export interface PricePoint {
  datetime: string; // ISO 8601 con offset CET/CEST
  value: number; // Precio en €/MWh
  percentage?: number; // Porcentaje relativo
}

export interface PriceSeries {
  title: string;
  magnitude: string;
  lastUpdate: string;
  values: PricePoint[];
}

export interface REEApiResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      title: string;
      lastUpdate: string;
      description?: string;
    };
  };
  meta?: {
    cacheControl?: {
      cache: string;
      expireAt?: string;
    };
  };
  included: Array<{
    type: string;
    id: string;
    attributes: {
      title: string;
      magnitude: string;
      lastUpdate: string;
      values: PricePoint[];
    };
  }>;
  errors?: Array<{
    code: string;
    status: string;
    title: string;
    detail: string;
  }>;
}

export interface HourlyPriceData {
  timestamp: Date;
  price: number; // €/kWh (convertido desde €/MWh)
  priceMwh: number; // €/MWh original
  hour: number;
  isCurrent: boolean;
  isTomorrow: boolean;
}

export interface PriceStats {
  min: number;
  max: number;
  average: number;
  current: number;
  percentile: number; // Posición actual en percentiles (0-100)
}

export interface PriceCategory {
  type: 'cheap' | 'normal' | 'expensive';
  color: string;
  bgColor: string;
  label: string;
}

// Tipos para electrodomésticos y optimización
export interface Appliance {
  id: string;
  name: string;
  power: number; // W
  duration: number; // horas
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  restrictions?: TimeRestriction[];
  priority: 'high' | 'medium' | 'low';
  optimized?: boolean;
  suggestedSchedule?: OptimizedSchedule;
}

export interface TimeRestriction {
  start: string; // HH:MM
  end: string; // HH:MM
  type: 'forbidden' | 'preferred';
}

export interface OptimizedSchedule {
  applianceId: string;
  startTime: string;
  endTime: string;
  duration: number;
  estimatedCost: number;
  savings: number; // Ahorro en € vs uso sin optimizar
  price: number; // €/kWh promedio durante el uso
}

export interface OptimizationResult {
  schedules: OptimizedSchedule[];
  totalSavings: number;
  baselineCost: number;
  optimizedCost: number;
  savingsPercentage: number;
  appliances: Appliance[];
}

export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  priceAlerts: PriceAlert[];
  defaultRestrictions: TimeRestriction[];
  optimizationStrategy: 'cost' | 'balanced' | 'convenience';
}

export interface PriceAlert {
  id: string;
  type: 'below' | 'above';
  threshold: number; // €/kWh
  enabled: boolean;
  createdAt: Date;
}

// Estados de la aplicación
export interface AppState {
  prices: HourlyPriceData[];
  currentDate: Date;
  appliances: Appliance[];
  optimization: OptimizationResult | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Constantes de la aplicación
export const API_CONFIG = {
  BASE_URL: 'https://apidatos.ree.es',
  ENDPOINT: 'es/datos/mercados/precios-mercados-tiempo-real',
  CACHE_TTL: 12 * 60 * 60 * 1000, // 12 horas en millisegundos
} as const;

export const PRICE_CATEGORIES: Record<string, PriceCategory> = {
  cheap: {
    type: 'cheap',
    color: '#10B981',
    bgColor: '#D1FAE5',
    label: 'Barato',
  },
  normal: {
    type: 'normal',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    label: 'Normal',
  },
  expensive: {
    type: 'expensive',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    label: 'Caro',
  },
};

// Funciones auxiliares
export function convertMWhToKWh(priceMWh: number): number {
  return Math.round((priceMWh / 1000) * 1e6) / 1e6; // 6 decimales
}

export function convertKWhToMWh(priceKWh: number): number {
  return Math.round(priceKWh * 1000 * 1e2) / 1e2; // 2 decimales
}

export function getPriceCategory(price: number, stats: PriceStats): PriceCategory {
  const percent = ((price - stats.min) / (stats.max - stats.min)) * 100;
  
  if (percent <= 33) return PRICE_CATEGORIES.cheap;
  if (percent <= 66) return PRICE_CATEGORIES.normal;
  return PRICE_CATEGORIES.expensive;
}

export function formatPrice(price: number, decimals: number = 3): string {
  return price.toFixed(decimals);
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatHour(hour: number): string {
  return hour.toString().padStart(2, '0') + ':00';
}
