import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { useAppliances } from '@/hooks/useAppState';
import { usePrices } from '@/hooks/useAppState';
import { Appliance } from '@/types/api';
import { ApplianceList } from './ApplianceList';
import { AddApplianceModal } from './AddApplianceModal';
import { OptimizationTimeline } from './OptimizationTimeline';
import { SavingsSummary } from './SavingsSummary';
import { EmptyState } from './EmptyState';

export function Planner() {
  const { appliances, optimization, addAppliance, updateAppliance, removeAppliance } = useAppliances();
  const { prices, loading } = usePrices();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);

  // Filtrar precios de hoy para la optimización
  const todayPrices = prices.filter(p => !p.isTomorrow);

  const handleAddAppliance = (applianceData: Omit<Appliance, 'id'>) => {
    addAppliance(applianceData);
    setShowAddModal(false);
  };

  const handleEditAppliance = (appliance: Appliance) => {
    setEditingAppliance(appliance);
    setShowAddModal(true);
  };

  const handleUpdateAppliance = (applianceData: Omit<Appliance, 'id'>) => {
    if (editingAppliance) {
      updateAppliance({
        ...applianceData,
        id: editingAppliance.id,
      });
    }
    setShowAddModal(false);
    setEditingAppliance(null);
  };

  const handleDeleteAppliance = (id: string) => {
    removeAppliance(id);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAppliance(null);
  };

  // Estado vacío
  if (appliances.length === 0 && !loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-6">
          <EmptyState onAddAppliance={() => setShowAddModal(true)} />
        </div>
        
        {showAddModal && (
          <AddApplianceModal
            onAdd={handleAddAppliance}
            onUpdate={handleUpdateAppliance}
            onClose={handleCloseModal}
            editingAppliance={editingAppliance}
          />
        )}
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Zap size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-title font-semibold text-foreground">
              Mis Electrodomésticos
            </h1>
            <p className="text-body-sm text-neutral-500">
              {appliances.length} aparato{appliances.length !== 1 ? 's' : ''} configurado{appliances.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          <span className="text-body-sm font-medium">Añadir</span>
        </button>
      </div>

      {/* Lista de electrodomésticos */}
      <ApplianceList
        appliances={appliances}
        onEdit={handleEditAppliance}
        onDelete={handleDeleteAppliance}
        loading={loading}
      />

      {/* Cronograma optimizado */}
      {optimization && todayPrices.length > 0 && (
        <>
          <OptimizationTimeline
            schedules={optimization.schedules}
            appliances={appliances}
            prices={todayPrices}
          />
          
          <SavingsSummary
            optimization={optimization}
          />
        </>
      )}

      {/* Modal para añadir/editar */}
      {showAddModal && (
        <AddApplianceModal
          onAdd={handleAddAppliance}
          onUpdate={handleUpdateAppliance}
          onClose={handleCloseModal}
          editingAppliance={editingAppliance}
        />
      )}
    </div>
  );
}
