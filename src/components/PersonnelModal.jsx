import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../data/initialStaff.js';
import { GROUPS } from '../services/schedulerEngine.js';

export default function PersonnelModal({ isOpen, onClose, onSave, staffToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    documentId: '',
    role: ROLES.ENFERMERO,
    group: 'G1',
    status: 'ACTIVO',
    phone: '',
    email: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        id: staffToEdit.id,
        name: staffToEdit.name || '',
        documentId: staffToEdit.documentId || '',
        role: staffToEdit.role || ROLES.ENFERMERO,
        group: staffToEdit.group || 'G1',
        status: staffToEdit.status || 'ACTIVO',
        phone: staffToEdit.phone || '',
        email: staffToEdit.email || ''
      });
    } else {
      setFormData({
        name: '',
        documentId: '',
        role: ROLES.ENFERMERO,
        group: 'G1',
        status: 'ACTIVO',
        phone: '',
        email: ''
      });
    }
    setError('');
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre y apellido es obligatorio.');
      return;
    }
    if (!formData.documentId.trim()) {
      setError('El número de documento / DNI es obligatorio.');
      return;
    }

    onSave({
      ...formData,
      id: staffToEdit ? staffToEdit.id : `staff-${Date.now()}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              {staffToEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {staffToEdit ? 'Editar Personal' : 'Registrar Nuevo Personal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nombres y Apellidos *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Lic. Rosa García Huamán"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                DNI / Documento *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 45891234"
                value={formData.documentId}
                onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado Operativo
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
              >
                <option value="ACTIVO">Activo (En servicio)</option>
                <option value="INACTIVO">Inactivo (Licencia / Baja)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cargo / Perfil *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
              >
                <option value={ROLES.ENFERMERO}>{ROLE_LABELS[ROLES.ENFERMERO]}</option>
                <option value={ROLES.TECNICO}>{ROLE_LABELS[ROLES.TECNICO]}</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {formData.role === ROLES.ENFERMERO ? 'Rotación: 2 por turno (MT/N)' : 'Rotación: 3 por turno (MT/N)'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Grupo de Guardia
              </label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white font-medium text-teal-800"
              >
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Guardia {g}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                5 grupos (G1..G5) para ciclo continuo de 3 días de descanso.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="Ej. 987-654-321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Ej. usuario@hospital.pe"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/30 transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{staffToEdit ? 'Actualizar Personal' : 'Registrar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
