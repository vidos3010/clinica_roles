import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, XCircle, Users, ShieldAlert, RotateCcw, Sun, Moon, Coffee, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../data/initialStaff.js';
import PersonnelModal from './PersonnelModal.jsx';

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function PersonnelManager({
  staffList,
  schedule = {},
  year = 2026,
  month = 9,
  displayStyle = 'MT_N',
  onSaveStaff,
  onDeleteStaff,
  onResetStaff
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [todayFilter, setTodayFilter] = useState('ALL'); // 'ALL' | 'ON_DUTY' | 'MT' | 'N' | 'D'

  // Current real date or chosen month day
  const realToday = new Date();
  const isViewingCurrentMonth = Number(year) === realToday.getFullYear() && Number(month) === (realToday.getMonth() + 1);
  const currentDay = isViewingCurrentMonth ? realToday.getDate() : 15;
  const dateObj = new Date(year, month - 1, currentDay);
  const dayOfWeekName = DAY_NAMES_ES[dateObj.getDay()];
  const monthName = MONTH_NAMES_ES[month - 1];

  // Enrich staff with their shift on today's date
  const staffWithTodayShift = useMemo(() => {
    return staffList.map(staff => {
      const todayShift = schedule?.[staff.id]?.[currentDay] || 'D';
      return {
        ...staff,
        todayShift
      };
    });
  }, [staffList, schedule, currentDay]);

  // Today shift counts
  const activeStaff = staffWithTodayShift.filter(s => s.status === 'ACTIVO');
  const onDutyTodayCount = activeStaff.filter(s => s.todayShift === 'MT' || s.todayShift === 'N').length;
  const dayShiftCount = activeStaff.filter(s => s.todayShift === 'MT').length;
  const nightShiftCount = activeStaff.filter(s => s.todayShift === 'N').length;
  const restCount = activeStaff.filter(s => s.todayShift === 'D' || s.todayShift === 'LIBRE' || s.todayShift === '').length;

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffWithTodayShift.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            staff.documentId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || staff.role === roleFilter;
      const matchesGroup = groupFilter === 'ALL' || staff.group === groupFilter;
      const matchesStatus = statusFilter === 'ALL' || staff.status === statusFilter;

      let matchesToday = true;
      if (todayFilter === 'ON_DUTY') {
        matchesToday = staff.todayShift === 'MT' || staff.todayShift === 'N';
      } else if (todayFilter === 'MT') {
        matchesToday = staff.todayShift === 'MT';
      } else if (todayFilter === 'N') {
        matchesToday = staff.todayShift === 'N';
      } else if (todayFilter === 'D') {
        matchesToday = staff.todayShift === 'D' || staff.todayShift === 'LIBRE' || staff.todayShift === '';
      }

      return matchesSearch && matchesRole && matchesGroup && matchesStatus && matchesToday;
    });
  }, [staffWithTodayShift, searchQuery, roleFilter, groupFilter, statusFilter, todayFilter]);

  // KPIs
  const totalEnfermeros = staffList.filter(s => s.role === ROLES.ENFERMERO && s.status === 'ACTIVO').length;
  const totalTecnicos = staffList.filter(s => s.role === ROLES.TECNICO && s.status === 'ACTIVO').length;

  const handleOpenNew = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (staff) => {
    const updated = {
      ...staff,
      status: staff.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    };
    onSaveStaff(updated);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Top Banner & KPI Cards (Now 4 Cards with "De Guardia Hoy" Highlighted) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Activos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Personal Activo</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {totalEnfermeros + totalTecnicos}{' '}
              <span className="text-xs font-normal text-slate-500">colaboradores</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Enfermeros */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lic. en Enfermería</p>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {totalEnfermeros}
              </span>
            </div>
            <p className="text-2xl font-black text-teal-700 mt-1">
              {totalEnfermeros}{' '}
              <span className="text-xs font-normal text-slate-500">(2 Día + 2 Noche)</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-sm shrink-0">
            LE
          </div>
        </div>

        {/* Card 3: Técnicos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Téc. de Enfermería</p>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {totalTecnicos}
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {totalTecnicos}{' '}
              <span className="text-xs font-normal text-slate-500">(3 Día + 3 Noche)</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
            TE
          </div>
        </div>

        {/* Card 4: DE GUARDIA HOY (RESALTADO DEL DÍA ACTUAL) */}
        <div className="bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-400 flex items-center justify-between text-slate-950">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="bg-slate-950 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Día {currentDay} • Hoy
              </span>
            </div>
            <p className="text-2xl font-black mt-1 text-slate-950">
              {onDutyTodayCount}{' '}
              <span className="text-xs font-bold text-slate-800">de guardia</span>
            </p>
            <p className="text-[11px] font-bold text-amber-950 mt-0.5">
              ☀️ {dayShiftCount} en Día • 🌙 {nightShiftCount} en Noche
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
            <Sun className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. DÍA ACTUAL RESALTADO: Interactive Highlight Banner */}
      <div className="bg-gradient-to-r from-[#001848] via-[#002060] to-[#1e3a8a] text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex flex-col items-center justify-center font-black shadow-md shrink-0">
            <span className="text-[9px] uppercase leading-none font-bold">Día</span>
            <span className="text-lg leading-none">{currentDay}</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Día Actual Resaltado
              </span>
              <span className="text-sm font-extrabold text-white">
                {dayOfWeekName}, {currentDay} de {monthName} de {year}
              </span>
            </div>
            <p className="text-[11px] text-blue-200 mt-0.5">
              Identifica rápidamente quién está asignado a Turno Día (8am-8pm), Turno Noche (8pm-8am) o en Descanso hoy.
            </p>
          </div>
        </div>

        {/* Quick Filter Chips for Today's Shifts */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 md:pt-0">
          <span className="text-blue-200 text-[11px] font-semibold mr-1">Filtrar por hoy:</span>
          <button
            onClick={() => setTodayFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
              todayFilter === 'ALL'
                ? 'bg-white text-[#002060] shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Todos ({staffList.length})
          </button>

          <button
            onClick={() => setTodayFilter('ON_DUTY')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs flex items-center space-x-1 ${
              todayFilter === 'ON_DUTY'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 text-amber-200 hover:bg-white/20'
            }`}
          >
            <span>🟢 De Turno ({onDutyTodayCount})</span>
          </button>

          <button
            onClick={() => setTodayFilter('MT')}
            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs flex items-center space-x-1 ${
              todayFilter === 'MT'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 text-amber-100 hover:bg-white/20'
            }`}
          >
            <span>☀️ Día ({dayShiftCount})</span>
          </button>

          <button
            onClick={() => setTodayFilter('N')}
            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs flex items-center space-x-1 ${
              todayFilter === 'N'
                ? 'bg-blue-400 text-slate-950 shadow-xs'
                : 'bg-white/10 text-blue-200 hover:bg-white/20'
            }`}
          >
            <span>🌙 Noche ({nightShiftCount})</span>
          </button>

          <button
            onClick={() => setTodayFilter('D')}
            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs flex items-center space-x-1 ${
              todayFilter === 'D'
                ? 'bg-slate-200 text-slate-900 shadow-xs'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <span>☕ Libre ({restCount})</span>
          </button>
        </div>
      </div>

      {/* 3. Actions & Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-2.5 sm:gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">Todos los Cargos</option>
            <option value={ROLES.ENFERMERO}>Lic. en Enfermería</option>
            <option value={ROLES.TECNICO}>Téc. en Enfermería</option>
          </select>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">Todas Guardias</option>
            <option value="G1">Guardia G1</option>
            <option value="G2">Guardia G2</option>
            <option value="G3">Guardia G3</option>
            <option value="G4">Guardia G4</option>
            <option value="G5">Guardia G5</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">Todos Estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>

          {/* Add button */}
          <button
            onClick={handleOpenNew}
            className="px-3.5 py-1.5 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar Personal</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* 4. Staff Table (Featuring the Highlighted "Turno Hoy" Column and Row Accents) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">N°</th>
                <th className="px-4 py-3.5 min-w-[200px]">Colaborador / Personal</th>
                <th className="px-3 py-3.5 text-center">DNI</th>
                <th className="px-3 py-3.5">Cargo</th>
                <th className="px-3 py-3.5 text-center">Grd</th>

                {/* COLUMNA RESALTADA: TURNO HOY (DÍA ACTUAL) */}
                <th className="px-4 py-3.5 text-center bg-[#002060] text-amber-300 font-black border-x-2 border-blue-900 shadow-xs">
                  <div className="flex items-center justify-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Turno Hoy (Día {currentDay})</span>
                  </div>
                </th>

                <th className="px-3 py-3.5">Teléfono</th>
                <th className="px-3 py-3.5 text-center">Estado</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff, idx) => {
                  const isDay = staff.todayShift === 'MT';
                  const isNight = staff.todayShift === 'N';
                  const isRest = staff.todayShift === 'D' || staff.todayShift === 'LIBRE' || staff.todayShift === '';
                  const isVac = staff.todayShift === 'VAC';
                  const isDm = staff.todayShift === 'DM';

                  // Row accent border if on duty today
                  const rowAccentClass = isDay
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/20'
                    : isNight
                    ? 'border-l-4 border-l-indigo-600 bg-blue-50/20'
                    : 'border-l-4 border-l-transparent';

                  return (
                    <tr key={staff.id} className={`${rowAccentClass} hover:bg-slate-50 transition-colors`}>
                      {/* N° */}
                      <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">
                        {idx + 1}
                      </td>

                      {/* Name with Live Duty Badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {staff.name}
                          </span>
                          {isDay && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 shrink-0 shadow-2xs">
                              <span>☀️</span>
                              <span>HOY DÍA</span>
                            </span>
                          )}
                          {isNight && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-indigo-100 text-indigo-950 border border-indigo-300 shrink-0 shadow-2xs">
                              <span>🌙</span>
                              <span>HOY NOCHE</span>
                            </span>
                          )}
                        </div>
                        {staff.email && <div className="text-[11px] text-slate-400 mt-0.5">{staff.email}</div>}
                      </td>

                      {/* DNI */}
                      <td className="px-3 py-3 text-center font-mono text-xs font-bold text-slate-700">
                        {staff.documentId || '—'}
                      </td>

                      {/* Cargo */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          staff.role === ROLES.ENFERMERO
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {staff.role === ROLES.ENFERMERO ? 'Lic. Enfermería' : 'Téc. Enfermería'}
                        </span>
                      </td>

                      {/* Guardia */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md font-black text-xs bg-slate-100 text-[#002060] border border-slate-200">
                          {staff.group || 'G1'}
                        </span>
                      </td>

                      {/* COLUMNA RESALTADA: TURNO HOY (DÍA ACTUAL) */}
                      <td className="px-4 py-3 text-center border-x-2 border-blue-200 bg-blue-50/40">
                        {isDay && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                            <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Turno Día (8am - 8pm)</span>
                          </span>
                        )}
                        {isNight && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-2xs">
                            <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Turno Noche (8pm - 8am)</span>
                          </span>
                        )}
                        {isRest && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Coffee className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Descanso (Libre)</span>
                          </span>
                        )}
                        {isVac && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🏖️ Vacaciones
                          </span>
                        )}
                        {isDm && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            🏥 Descanso Médico
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {staff.phone || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          title="Clic para alternar estado"
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            staff.status === 'ACTIVO'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {staff.status === 'ACTIVO' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleEdit(staff)}
                            title="Editar información"
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar a ${staff.name}?`)) {
                                onDeleteStaff(staff.id);
                              }
                            }}
                            title="Eliminar registro"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Registering / Editing */}
      <PersonnelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveStaff}
        staffToEdit={editingStaff}
      />
    </div>
  );
}
