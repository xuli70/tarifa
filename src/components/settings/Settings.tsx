import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Clock, 
  Moon, 
  Sun,
  Shield,
  Info,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { usePreferences } from '@/hooks/useAppState';
import { UserPreferences, TimeRestriction } from '@/types/api';
import { cn } from '@/lib/utils';

export function Settings() {
  const { preferences, updatePreferences } = usePreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences(localPrefs);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPrefs(preferences);
    setHasChanges(false);
  };

  const addGlobalRestriction = () => {
    const newRestriction: TimeRestriction = {
      start: '22:00',
      end: '08:00',
      type: 'forbidden',
    };
    
    handlePreferenceChange('defaultRestrictions', [
      ...(localPrefs.defaultRestrictions || []),
      newRestriction
    ]);
  };

  const removeGlobalRestriction = (index: number) => {
    const updated = localPrefs.defaultRestrictions?.filter((_, i) => i !== index) || [];
    handlePreferenceChange('defaultRestrictions', updated);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <SettingsIcon size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-title font-semibold text-foreground">
              Configuración
            </h1>
            <p className="text-body-sm text-neutral-500">
              Personaliza tu experiencia
            </p>
          </div>
        </div>
        
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors text-body-sm"
            >
              <RotateCcw size={16} />
              Descartar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors text-body-sm font-medium"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Preferencias visuales */}
      <SettingsSection title="Preferencias visuales" icon={Sun}>
        <SettingsToggle
          label="Modo oscuro"
          description="Cambiar entre tema claro y oscuro"
          checked={localPrefs.darkMode}
          onChange={(checked) => handlePreferenceChange('darkMode', checked)}
          icon={localPrefs.darkMode ? Moon : Sun}
        />
        
        <SettingsToggle
          label="Notificaciones"
          description="Recibir alertas sobre precios de electricidad"
          checked={localPrefs.notificationsEnabled}
          onChange={(checked) => handlePreferenceChange('notificationsEnabled', checked)}
          icon={Bell}
        />
      </SettingsSection>

      {/* Estrategia de optimización */}
      <SettingsSection title="Estrategia de optimización" icon={SettingsIcon}>
        <div className="space-y-3">
          {[
            { 
              value: 'cost', 
              label: 'Solo ahorro', 
              desc: 'Prioriza únicamente el menor costo' 
            },
            { 
              value: 'balanced', 
              label: 'Equilibrado', 
              desc: 'Balance entre ahorro y conveniencia' 
            },
            { 
              value: 'convenience', 
              label: 'Solo conveniencia', 
              desc: 'Prioriza horarios convenientes' 
            },
          ].map((option) => (
            <SettingsRadio
              key={option.value}
              label={option.label}
              description={option.desc}
              checked={localPrefs.optimizationStrategy === option.value}
              onChange={() => handlePreferenceChange('optimizationStrategy', option.value as any)}
            />
          ))}
        </div>
      </SettingsSection>

      {/* Restricciones globales */}
      <SettingsSection title="Restricciones globales" icon={Clock}>
        <div className="space-y-4">
          <p className="text-body-sm text-neutral-600">
            Estas restricciones se aplican a todos los electrodomésticos por defecto
          </p>
          
          {localPrefs.defaultRestrictions?.map((restriction, index) => (
            <GlobalRestrictionItem
              key={index}
              restriction={restriction}
              onRemove={() => removeGlobalRestriction(index)}
            />
          ))}
          
          <button
            onClick={addGlobalRestriction}
            className="w-full p-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-primary-300 hover:text-primary-600 transition-colors text-body-sm"
          >
            + Añadir restricción global
          </button>
        </div>
      </SettingsSection>

      {/* Alertas de precio */}
      <SettingsSection title="Alertas de precio" icon={Bell}>
        <div className="space-y-4">
          {localPrefs.priceAlerts.map((alert) => (
            <PriceAlertItem
              key={alert.id}
              alert={alert}
              onRemove={() => {
                const updated = localPrefs.priceAlerts.filter(a => a.id !== alert.id);
                handlePreferenceChange('priceAlerts', updated);
              }}
            />
          ))}
          
          <button
            onClick={() => {
              const newAlert = {
                type: 'below' as const,
                threshold: 0.10,
                enabled: true,
              };
              handlePreferenceChange('priceAlerts', [...localPrefs.priceAlerts, { ...newAlert, id: Date.now().toString(), createdAt: new Date() }]);
            }}
            className="w-full p-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-primary-300 hover:text-primary-600 transition-colors text-body-sm"
          >
            + Nueva alerta
          </button>
        </div>
      </SettingsSection>

      {/* Información de la app */}
      <SettingsSection title="Información" icon={Info}>
        <div className="space-y-4">
          <SettingsLink
            title="Acerca de la app"
            description="Información sobre Precios Electricidad España"
            onClick={() => {}}
          />
          
          <SettingsLink
            title="API de datos"
            description="Precios en tiempo real de REE (Red Eléctrica de España)"
            onClick={() => {}}
          />
          
          <SettingsLink
            title="Términos de uso"
            description="Condiciones de uso de la aplicación"
            onClick={() => {}}
          />
          
          <SettingsLink
            title="Política de privacidad"
            description="Cómo manejamos tus datos"
            onClick={() => {}}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

// Componentes auxiliares
interface SettingsSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}

function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon size={20} className="text-primary-600" />
        </div>
        <h2 className="text-subtitle font-semibold text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

function SettingsToggle({ label, description, checked, onChange, icon: Icon }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={16} className="text-neutral-500" />}
        <div>
          <div className="text-body-sm font-medium text-foreground">
            {label}
          </div>
          {description && (
            <div className="text-body-sm text-neutral-500">
              {description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary-500' : 'bg-neutral-300'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

interface SettingsRadioProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function SettingsRadio({ label, description, checked, onChange }: SettingsRadioProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 text-primary-500 border-neutral-300 focus:ring-primary-500"
      />
      <div>
        <div className="text-body-sm font-medium text-foreground">
          {label}
        </div>
        <div className="text-body-sm text-neutral-500">
          {description}
        </div>
      </div>
    </label>
  );
}

interface SettingsLinkProps {
  title: string;
  description: string;
  onClick: () => void;
}

function SettingsLink({ title, description, onClick }: SettingsLinkProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 text-left hover:bg-neutral-50 rounded-lg transition-colors"
    >
      <div>
        <div className="text-body-sm font-medium text-foreground">
          {title}
        </div>
        <div className="text-body-sm text-neutral-500">
          {description}
        </div>
      </div>
      <ChevronRight size={16} className="text-neutral-400" />
    </button>
  );
}

interface GlobalRestrictionItemProps {
  restriction: TimeRestriction;
  onRemove: () => void;
}

function GlobalRestrictionItem({ restriction, onRemove }: GlobalRestrictionItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={cn(
          'px-2 py-1 rounded text-caption font-medium',
          restriction.type === 'forbidden' 
            ? 'bg-semantic-danger-bg text-semantic-danger' 
            : 'bg-semantic-success-bg text-semantic-success'
        )}>
          {restriction.type === 'forbidden' ? 'Prohibido' : 'Preferido'}
        </div>
        <span className="text-body-sm text-foreground">
          {restriction.start} - {restriction.end}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-neutral-500 hover:text-semantic-danger"
      >
        ×
      </button>
    </div>
  );
}

interface PriceAlertItemProps {
  alert: any;
  onRemove: () => void;
}

function PriceAlertItem({ alert, onRemove }: PriceAlertItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
      <div className="flex items-center gap-3">
        <Bell size={16} className="text-neutral-500" />
        <div>
          <div className="text-body-sm font-medium text-foreground">
            Precio {alert.type === 'below' ? 'por debajo de' : 'por encima de'} {alert.threshold}€/kWh
          </div>
          <div className="text-body-sm text-neutral-500">
            {alert.enabled ? 'Activa' : 'Inactiva'}
          </div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-neutral-500 hover:text-semantic-danger"
      >
        ×
      </button>
    </div>
  );
}
