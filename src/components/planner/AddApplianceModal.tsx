import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Zap, Clock, Power } from 'lucide-react';
import { Appliance, TimeRestriction } from '@/types/api';
import { optimizationService } from '@/services/optimizationService';

interface AddApplianceModalProps {
  onAdd: (appliance: Omit<Appliance, 'id'>) => void;
  onUpdate: (appliance: Omit<Appliance, 'id'>) => void;
  onClose: () => void;
  editingAppliance: Appliance | null;
}

// Electrodomésticos predefinidos comunes
const PRESET_APPLIANCES = [
  { name: 'Lavadora', power: 2000, duration: 2 },
  { name: 'Lavavajillas', power: 1800, duration: 2 },
  { name: 'Secadora', power: 2500, duration: 1.5 },
  { name: 'Horno eléctrico', power: 2200, duration: 1 },
  { name: 'Microondas', power: 1200, duration: 0.5 },
  { name: 'Aire acondicionado', power: 1500, duration: 8 },
  { name: 'Calentador de agua', power: 3000, duration: 3 },
  { name: 'Aspiradora', power: 1200, duration: 1 },
];

export function AddApplianceModal({ 
  onAdd, 
  onUpdate, 
  onClose, 
  editingAppliance 
}: AddApplianceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    power: '',
    duration: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    restrictions: [] as TimeRestriction[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRestrictionForm, setShowRestrictionForm] = useState(false);
  const [newRestriction, setNewRestriction] = useState({
    start: '',
    end: '',
    type: 'forbidden' as 'forbidden' | 'preferred',
  });

  // Cargar datos del electrodoméstico en edición
  useEffect(() => {
    if (editingAppliance) {
      setFormData({
        name: editingAppliance.name,
        power: editingAppliance.power.toString(),
        duration: editingAppliance.duration.toString(),
        priority: editingAppliance.priority,
        restrictions: editingAppliance.restrictions || [],
      });
    }
  }, [editingAppliance]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    const power = parseFloat(formData.power);
    if (!formData.power || isNaN(power) || power <= 0) {
      newErrors.power = 'La potencia debe ser un número mayor que 0';
    } else if (power > 10000) {
      newErrors.power = 'La potencia no puede ser mayor a 10,000W';
    }

    const duration = parseFloat(formData.duration);
    if (!formData.duration || isNaN(duration) || duration <= 0) {
      newErrors.duration = 'La duración debe ser un número mayor que 0';
    } else if (duration > 24) {
      newErrors.duration = 'La duración no puede ser mayor a 24 horas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const applianceData = {
      name: formData.name.trim(),
      power: parseFloat(formData.power),
      duration: parseFloat(formData.duration),
      priority: formData.priority,
      restrictions: formData.restrictions,
    };

    if (editingAppliance) {
      onUpdate(applianceData);
    } else {
      onAdd(applianceData);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_APPLIANCES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      power: preset.power.toString(),
      duration: preset.duration.toString(),
    }));
  };

  const addRestriction = () => {
    if (!newRestriction.start || !newRestriction.end) return;

    const restriction: TimeRestriction = {
      start: newRestriction.start,
      end: newRestriction.end,
      type: newRestriction.type,
    };

    setFormData(prev => ({
      ...prev,
      restrictions: [...prev.restrictions, restriction],
    }));

    setNewRestriction({ start: '', end: '', type: 'forbidden' });
    setShowRestrictionForm(false);
  };

  const removeRestriction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-fade-in">
      <div 
        className="bg-background-surface w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title font-semibold text-foreground">
            {editingAppliance ? 'Editar electrodoméstico' : 'Añadir electrodoméstico'}
          </h2>
          <button 
            onClick={onClose}
            className="touch-target p-2 -m-2"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Electrodomésticos predefinidos */}
          <div>
            <label className="text-body-sm font-medium text-foreground mb-3 block">
              Aparatos comunes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_APPLIANCES.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 text-left bg-neutral-100 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <div className="text-body-sm font-medium text-foreground">
                    {preset.name}
                  </div>
                  <div className="text-caption text-neutral-600">
                    {preset.power}W • {preset.duration}h
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-body-sm font-medium text-foreground mb-2 block">
              Nombre del electrodoméstico *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`input-base ${errors.name ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger' : ''}`}
              placeholder="Ej: Lavadora, Horno eléctrico..."
            />
            {errors.name && (
              <p className="text-caption text-semantic-danger mt-1">{errors.name}</p>
            )}
          </div>

          {/* Potencia y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-sm font-medium text-foreground mb-2 block">
                <Zap size={16} className="inline mr-1" />
                Potencia (W) *
              </label>
              <input
                type="number"
                value={formData.power}
                onChange={(e) => setFormData(prev => ({ ...prev, power: e.target.value }))}
                className={`input-base ${errors.power ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger' : ''}`}
                placeholder="2000"
                min="1"
                max="10000"
              />
              {errors.power && (
                <p className="text-caption text-semantic-danger mt-1">{errors.power}</p>
              )}
            </div>

            <div>
              <label className="text-body-sm font-medium text-foreground mb-2 block">
                <Clock size={16} className="inline mr-1" />
                Duración (h) *
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className={`input-base ${errors.duration ? 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger' : ''}`}
                placeholder="2"
                min="0.5"
                max="24"
              />
              {errors.duration && (
                <p className="text-caption text-semantic-danger mt-1">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="text-body-sm font-medium text-foreground mb-2 block">
              Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'high', label: 'Alta', color: 'text-semantic-danger', desc: 'Crítico' },
                { value: 'medium', label: 'Media', color: 'text-semantic-warning', desc: 'Normal' },
                { value: 'low', label: 'Baja', color: 'text-semantic-success', desc: 'Flexible' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  className={`p-3 text-center rounded-lg border-2 transition-colors ${
                    formData.priority === priority.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`text-body-sm font-medium ${priority.color}`}>
                    {priority.label}
                  </div>
                  <div className="text-caption text-neutral-500">
                    {priority.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Restricciones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-body-sm font-medium text-foreground">
                Restricciones horarias
              </label>
              <button
                type="button"
                onClick={() => setShowRestrictionForm(true)}
                className="text-primary-500 hover:text-primary-600 text-body-sm"
              >
                + Añadir
              </button>
            </div>

            {/* Lista de restricciones */}
            {formData.restrictions.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.restrictions.map((restriction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-neutral-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-caption ${
                        restriction.type === 'forbidden' 
                          ? 'bg-semantic-danger-bg text-semantic-danger' 
                          : 'bg-semantic-success-bg text-semantic-success'
                      }`}>
                        {restriction.type === 'forbidden' ? 'Prohibido' : 'Preferido'}
                      </span>
                      <span className="text-body-sm text-foreground">
                        {restriction.start} - {restriction.end}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRestriction(index)}
                      className="p-1 text-neutral-500 hover:text-semantic-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario de nueva restricción */}
            {showRestrictionForm && (
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <select
                    value={newRestriction.type}
                    onChange={(e) => setNewRestriction(prev => ({ ...prev, type: e.target.value as any }))}
                    className="px-3 py-2 border border-neutral-200 rounded text-body-sm"
                  >
                    <option value="forbidden">Prohibido</option>
                    <option value="preferred">Preferido</option>
                  </select>
                  <input
                    type="time"
                    value={newRestriction.start}
                    onChange={(e) => setNewRestriction(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-neutral-200 rounded text-body-sm"
                  />
                  <input
                    type="time"
                    value={newRestriction.end}
                    onChange={(e) => setNewRestriction(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-neutral-200 rounded text-body-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addRestriction}
                    className="px-3 py-1 bg-primary-500 text-primary-foreground text-body-sm rounded hover:bg-primary-600"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRestrictionForm(false)}
                    className="px-3 py-1 bg-neutral-200 text-neutral-700 text-body-sm rounded hover:bg-neutral-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors text-body font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-500 text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors text-body font-medium"
            >
              {editingAppliance ? 'Actualizar' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
