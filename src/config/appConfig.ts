interface AppConfig {
  pinCode: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: {
      PIN_CODE?: string;
    };
  }
}

export function getAppConfig(): AppConfig {
  // En produccion, usa la config inyectada por Docker
  // En desarrollo, usa variables de Vite
  const runtimeConfig = window.__APP_CONFIG__;

  // Si el placeholder no fue reemplazado, usar fallback
  const runtimePin = runtimeConfig?.PIN_CODE;
  const isPlaceholder = runtimePin === "__PIN_CODE__" || !runtimePin;

  return {
    pinCode: isPlaceholder
      ? (import.meta.env.VITE_PIN_CODE || "1111")
      : runtimePin
  };
}
