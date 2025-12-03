import React from 'react';
import { 
  Edit, 
  Trash2, 
  Zap, 
  Clock, 
  Power,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Appliance } from '@/types/api';
import { optimizationService } from '@/services/optimizationService';
import { formatPrice } from '@/types/api';
import { cn } from '@/lib/utils';

interface ApplianceListProps {
  appliances: Appliance[];
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function ApplianceList({ 
  appliances, 
  onEdit, 
  onDelete, 
  loading = false 
}: ApplianceListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-base p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-neutral-200 rounded" />
                  <div className="w-24 h-3 bg-neutral-200 rounded" />
                </div>
              </div>
              <div className="w-8 h-8 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appliances.map((appliance) => (
        <ApplianceCard
          key={appliance.id}
          appliance={appliance}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface ApplianceCardProps {
  appliance: Appliance;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
}

function ApplianceCard({ appliance, onEdit, onDelete }: ApplianceCardProps) {
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-semantic-danger';
      case 'medium':
        return 'text-semantic-warning';
      case 'low':
        return 'text-semantic-success';
      default:
        return 'text-neutral-500';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  const totalKWh = (appliance.power * appliance.duration) / 1000;

  return (
    <div className="card-base p-6 animate-fade-in group hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icono del electrodoméstico */}
          <div className="p-3 bg-primary-100 rounded-lg">
            <Power size={24} className="text-primary-600" />
          </div>
          
          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-subtitle font-semibold text-foreground truncate">
                {appliance.name}
              </h3>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-caption font-medium',
                'bg-neutral-100 text-neutral-600'
              )}>
                {getPriorityLabel(appliance.priority)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-neutral-500" />
                <div>
                  <p className="text-body-sm text-neutral-600">Potencia</p>
                  <p className="text-body font-medium text-foreground">
                    {appliance.power}W
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-neutral-500" />
                <div>
                  <p className="text-body-sm text-neutral-600">Duración</p>
                  <p className="text-body font-medium text-foreground">
                    {appliance.duration}h
                  </p>
                </div>
              </div>
            </div>
            
            {/* Consumo total */}
            <div className="flex items-center gap-2 mb-3">
              <div className="text-body-sm text-neutral-600">
                Consumo total: <span className="font-medium text-foreground">{totalKWh.toFixed(2)} kWh</span>
              </div>
            </div>
            
            {/* Horario recomendado */}
            {appliance.suggestedSchedule && (
              <div className="flex items-center gap-2 p-2 bg-semantic-success-bg rounded-lg">
                <TrendingUp size={16} className="text-semantic-success" />
                <div>
                  <p className="text-body-sm font-medium text-semantic-success">
                    Horario óptimo
                  </p>
                  <p className="text-body-sm text-semantic-success">
                    {appliance.suggestedSchedule.startTime} - {appliance.suggestedSchedule.endTime} 
                    ({appliance.suggestedSchedule.estimatedCost.toFixed(2)}€)
                  </p>
                </div>
              </div>
            )}
            
            {/* Restricciones */}
            {appliance.restrictions && appliance.restrictions.length > 0 && (
              <div className="mt-2">
                <p className="text-body-sm text-neutral-600 mb-1">Restricciones:</p>
                <div className="flex flex-wrap gap-1">
                  {appliance.restrictions.map((restriction, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-neutral-200 text-neutral-700 text-caption rounded"
                    >
                      {restriction.type === 'forbidden' ? 'Prohibido' : 'Preferido'}: {restriction.start}-{restriction.end}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onEdit(appliance)}
            className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(appliance.id)}
            className="p-2 text-neutral-500 hover:text-semantic-danger hover:bg-semantic-danger-bg rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={() => onEdit(appliance)}
            className="p-2 text-neutral-400 group-hover:text-neutral-600 transition-colors"
            title="Ver detalles"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
