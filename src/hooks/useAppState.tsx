import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  AppState, 
  Appliance, 
  HourlyPriceData, 
  OptimizationResult, 
  UserPreferences,
  PriceAlert,
  TimeRestriction
} from '../types/api';
import { reeApiService } from '../services/reeApi';
import { optimizationService } from '../services/optimizationService';

// Tipos para las acciones del reducer
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRICES'; payload: { today: HourlyPriceData[]; tomorrow: HourlyPriceData[] } }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'ADD_APPLIANCE'; payload: Appliance }
  | { type: 'UPDATE_APPLIANCE'; payload: Appliance }
  | { type: 'REMOVE_APPLIANCE'; payload: string }
  | { type: 'SET_OPTIMIZATION'; payload: OptimizationResult }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_LAST_UPDATED'; payload: Date }
  | { type: 'CLEAR_APPLIANCES' }
  | { type: 'IMPORT_APPLIANCES'; payload: Appliance[] };

// Estado inicial
const initialState: AppState = {
  prices: [],
  currentDate: new Date(),
  appliances: [],
  optimization: null,
  preferences: {
    darkMode: false,
    notificationsEnabled: true,
    priceAlerts: [],
    defaultRestrictions: [],
    optimizationStrategy: 'cost',
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

// Reducer para manejar acciones
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PRICES':
      const todayPrices = action.payload.today.map(price => ({ ...price, isTomorrow: false }));
      const tomorrowPrices = action.payload.tomorrow.map(price => ({ ...price, isTomorrow: true }));
      
      return {
        ...state,
        prices: [...todayPrices, ...tomorrowPrices],
        loading: false,
        error: null,
      };
    
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    
    case 'ADD_APPLIANCE':
      const newAppliances = [...state.appliances, action.payload];
      return { 
        ...state, 
        appliances: newAppliances,
        optimization: null, // Reset optimization when adding appliance
      };
    
    case 'UPDATE_APPLIANCE':
      const updatedAppliances = state.appliances.map(app => 
        app.id === action.payload.id ? action.payload : app
      );
      return { 
        ...state, 
        appliances: updatedAppliances,
        optimization: null, // Reset optimization when updating appliance
      };
    
    case 'REMOVE_APPLIANCE':
      const filteredAppliances = state.appliances.filter(app => app.id !== action.payload);
      return { 
        ...state, 
        appliances: filteredAppliances,
        optimization: null, // Reset optimization when removing appliance
      };
    
    case 'SET_OPTIMIZATION':
      return { ...state, optimization: action.payload };
    
    case 'UPDATE_PREFERENCES':
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload }
      };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    case 'CLEAR_APPLIANCES':
      return { 
        ...state, 
        appliances: [],
        optimization: null,
      };
    
    case 'IMPORT_APPLIANCES':
      return { 
        ...state, 
        appliances: action.payload,
        optimization: null,
      };
    
    default:
      return state;
  }
}

// Contexto
interface AppContextType {
  state: AppState;
  actions: {
    loadPrices: (date?: Date) => Promise<void>;
    addAppliance: (appliance: Omit<Appliance, 'id'>) => void;
    updateAppliance: (appliance: Appliance) => void;
    removeAppliance: (id: string) => void;
    clearAppliances: () => void;
    optimizeAppliances: () => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
    removePriceAlert: (id: string) => void;
    setCurrentDate: (date: Date) => void;
    retry: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider del contexto
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar precios desde la API
  const loadPrices = async (date: Date = new Date()) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await reeApiService.getTodayAndTomorrowPrices();
      dispatch({ type: 'SET_PRICES', payload: result });
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
      
      // Si hay electrodomésticos, recalcular optimización
      if (state.appliances.length > 0) {
        optimizeAppliances();
      }
    } catch (error) {
      console.error('Error loading prices:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      });
    }
  };

  // Añadir electrodoméstico
  const addAppliance = (applianceData: Omit<Appliance, 'id'>) => {
    const appliance: Appliance = {
      ...applianceData,
      id: generateId(),
    };
    dispatch({ type: 'ADD_APPLIANCE', payload: appliance });
    
    // Guardar en localStorage
    saveAppliancesToStorage([...state.appliances, appliance]);
  };

  // Actualizar electrodoméstico
  const updateAppliance = (appliance: Appliance) => {
    dispatch({ type: 'UPDATE_APPLIANCE', payload: appliance });
    
    // Actualizar en localStorage
    const updatedAppliances = state.appliances.map(app => 
      app.id === appliance.id ? appliance : app
    );
    saveAppliancesToStorage(updatedAppliances);
  };

  // Eliminar electrodoméstico
  const removeAppliance = (id: string) => {
    dispatch({ type: 'REMOVE_APPLIANCE', payload: id });
    
    // Actualizar localStorage
    const filteredAppliances = state.appliances.filter(app => app.id !== id);
    saveAppliancesToStorage(filteredAppliances);
  };

  // Limpiar todos los electrodomésticos
  const clearAppliances = () => {
    dispatch({ type: 'CLEAR_APPLIANCES' });
    if (isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(STORAGE_KEYS.APPLIANCES);
      } catch {
        // Silent fail
      }
    }
  };

  // Optimizar electrodomésticos
  const optimizeAppliances = () => {
    if (state.prices.length === 0 || state.appliances.length === 0) {
      return;
    }

    try {
      // Filtrar solo precios de hoy para la optimización
      const todayPrices = state.prices.filter(p => !p.isTomorrow);
      const result = optimizationService.optimizeAppliances(state.appliances, todayPrices);
      dispatch({ type: 'SET_OPTIMIZATION', payload: result });
    } catch (error) {
      console.error('Error optimizing appliances:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Error al optimizar electrodomésticos' 
      });
    }
  };

  // Actualizar preferencias
  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });

    // Guardar en localStorage (iOS Safari safe)
    if (isLocalStorageAvailable()) {
      try {
        const updatedPreferences = { ...state.preferences, ...preferences };
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPreferences));
      } catch {
        // Silent fail for Safari private browsing
      }
    }
  };

  // Añadir alerta de precio
  const addPriceAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const alert: PriceAlert = {
      ...alertData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    const updatedAlerts = [...state.preferences.priceAlerts, alert];
    updatePreferences({ priceAlerts: updatedAlerts });
  };

  // Eliminar alerta de precio
  const removePriceAlert = (id: string) => {
    const updatedAlerts = state.preferences.priceAlerts.filter(alert => alert.id !== id);
    updatePreferences({ priceAlerts: updatedAlerts });
  };

  // Establecer fecha actual
  const setCurrentDate = (date: Date) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
    loadPrices(date);
  };

  // Reintentar operación fallida
  const retry = async () => {
    await loadPrices(state.currentDate);
  };

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedAppliances = loadAppliancesFromStorage();
    const savedPreferences = loadPreferencesFromStorage();
    
    if (savedAppliances.length > 0) {
      dispatch({ type: 'IMPORT_APPLIANCES', payload: savedAppliances });
    }
    
    if (savedPreferences) {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: savedPreferences });
    }
  }, []);

  // Cargar precios iniciales
  useEffect(() => {
    loadPrices();
  }, []);

  // Auto-refresh precios cada 5 minutos (iOS battery optimization: skip when in background)
  useEffect(() => {
    const interval = setInterval(() => {
      // iOS Safari: don't refresh when page is hidden (saves battery)
      if (document.hidden) return;
      if (!state.loading && !state.error) {
        loadPrices(state.currentDate);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.currentDate, state.loading, state.error]);

  // Auto-optimizar cuando cambien precios o electrodomésticos
  useEffect(() => {
    if (state.appliances.length > 0 && state.prices.length > 0) {
      optimizeAppliances();
    }
  }, [state.appliances, state.prices]);

  const actions = {
    loadPrices,
    addAppliance,
    updateAppliance,
    removeAppliance,
    clearAppliances,
    optimizeAppliances,
    updatePreferences,
    addPriceAlert,
    removePriceAlert,
    setCurrentDate,
    retry,
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar el contexto
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Funciones auxiliares para localStorage
// iOS Safari private browsing compatibility: check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Storage keys without spaces for better Safari compatibility
const STORAGE_KEYS = {
  APPLIANCES: 'tarifa_appliances',
  PREFERENCES: 'tarifa_preferences',
} as const;

// Migration: move old keys to new keys (one-time migration)
function migrateOldStorageKeys(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    // Migrate appliances
    const oldAppliances = localStorage.getItem('app Appliances');
    if (oldAppliances && !localStorage.getItem(STORAGE_KEYS.APPLIANCES)) {
      localStorage.setItem(STORAGE_KEYS.APPLIANCES, oldAppliances);
      localStorage.removeItem('app Appliances');
    }

    // Migrate preferences
    const oldPreferences = localStorage.getItem('app Preferences');
    if (oldPreferences && !localStorage.getItem(STORAGE_KEYS.PREFERENCES)) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, oldPreferences);
      localStorage.removeItem('app Preferences');
    }
  } catch {
    // Silent fail on migration
  }
}

// Run migration on module load
migrateOldStorageKeys();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function saveAppliancesToStorage(appliances: Appliance[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(appliances));
  } catch (error) {
    // iOS Safari: QuotaExceededError in private browsing
    console.error('Error saving appliances to localStorage:', error);
  }
}

function loadAppliancesFromStorage(): Appliance[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APPLIANCES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading appliances from localStorage:', error);
    return [];
  }
}

function loadPreferencesFromStorage(): UserPreferences | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading preferences from localStorage:', error);
    return null;
  }
}

// Hooks específicos para partes de la aplicación
export function usePrices() {
  const { state, actions } = useApp();
  
  return {
    prices: state.prices,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    loadPrices: actions.loadPrices,
    retry: actions.retry,
  };
}

export function useAppliances() {
  const { state, actions } = useApp();
  
  return {
    appliances: state.appliances,
    optimization: state.optimization,
    addAppliance: actions.addAppliance,
    updateAppliance: actions.updateAppliance,
    removeAppliance: actions.removeAppliance,
    clearAppliances: actions.clearAppliances,
    optimizeAppliances: actions.optimizeAppliances,
  };
}

export function usePreferences() {
  const { state, actions } = useApp();
  
  return {
    preferences: state.preferences,
    updatePreferences: actions.updatePreferences,
    addPriceAlert: actions.addPriceAlert,
    removePriceAlert: actions.removePriceAlert,
  };
}
