import React, { useState } from 'react';
import { Calendar, Zap, FileSpreadsheet, Printer, RefreshCw, Info, ChevronLeft, ChevronRight, Building2, MapPin, Search, CheckCircle2, Sparkles } from 'lucide-react';
import { GROUPS } from '../services/schedulerEngine.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ScheduleHeader({
  year,
  month,
  totalDays = 30,
  onMonthYearChange,
  startGroup,
  setStartGroup,
  clinicInfo,
  displayStyle,
  setDisplayStyle,
  colorTheme,
  setColorTheme,
  density,
  setDensity,
  searchFilter,
  setSearchFilter,
  onGenerate,
  onLoadOfficial,
  onExportExcel,
  onPrint,
  onClear,
  saveStatus = 'saved',
  onApplyGlobalFromDay
}) {
  const [isManualRotateOpen, setIsManualRotateOpen] = useState(false);
  const [manualFromDay, setManualFromDay] = useState(1);
  const [manualGroup, setManualGroup] = useState(startGroup);

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthYearChange(year - 1, 12);
    } else {
      onMonthYearChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthYearChange(year + 1, 1);
    } else {
      onMonthYearChange(year, month + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-3 sm:p-5 space-y-3 sm:space-y-4 no-print">
      {/* 1. Hospital Letterhead Banner */}
      <div className="bg-gradient-to-r from-[#001848] via-[#002060] to-[#1e3a8a] text-white rounded-xl p-3 sm:p-4 shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
              {MONTH_NAMES[month - 1].toUpperCase()} {year}
            </span>
            <div className="flex items-center space-x-1 text-xs text-blue-100">
              <Building2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs">{clinicInfo.sede}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-black text-white">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>ÁREA: {clinicInfo.area}</span>
          </div>
        </div>

        {/* View and Style Settings Controls - Responsive Wrap */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs pt-1 lg:pt-0">
          {/* Nomenclatura */}
          <div className="bg-white/10 p-1 rounded-xl backdrop-blur-xs flex items-center space-x-1">
            <span className="text-blue-200 text-[11px] pl-1 pr-0.5 font-medium">Turnos:</span>
            <button
              onClick={() => setDisplayStyle('D_N')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                displayStyle === 'D_N'
                  ? 'bg-white text-[#002060] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
              title="D = Diurno (12h), N = Nocturno (12h)"
            >
              D / N
            </button>
            <button
              onClick={() => setDisplayStyle('MT_N')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                displayStyle === 'MT_N'
                  ? 'bg-white text-[#002060] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
              title="MT = Diurno, N = Nocturno"
            >
              MT / N
            </button>
          </div>

          {/* Theme */}
          <div className="bg-white/10 p-1 rounded-xl backdrop-blur-xs flex items-center space-x-1">
            <span className="text-blue-200 text-[11px] pl-1 pr-0.5 font-medium">Diseño:</span>
            <button
              onClick={() => setColorTheme('classic')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                colorTheme === 'classic'
                  ? 'bg-white text-[#002060] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
              title="Estilo oficial tipo Excel"
            >
              Clásico
            </button>
            <button
              onClick={() => setColorTheme('modern')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                colorTheme === 'modern'
                  ? 'bg-white text-[#002060] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
              title="Estilo con distintivos de colores suaves"
            >
              Suave
            </button>
          </div>

          {/* Density */}
          <div className="bg-white/10 p-1 rounded-xl backdrop-blur-xs flex items-center space-x-1">
            <button
              onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
              className="px-2 py-0.5 rounded-lg font-bold text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs"
              title="Alternar densidad de filas y columnas"
            >
              {density === 'compact' ? '📐 Compacta' : '📐 Amplia'}
            </button>
          </div>

          {/* Real-time Auto-save status badge */}
          <div className="bg-white/10 px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center space-x-1.5 text-xs border border-white/20 shrink-0">
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span className="text-amber-200 font-bold text-[11px]">Guardando...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 font-bold text-[11px] hidden sm:inline">Guardado automático</span>
                <span className="text-emerald-300 font-bold text-[11px] sm:hidden">Guardado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Left: Date navigation + Group + Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month/Year selector */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-300 rounded-xl p-1 shrink-0">
            <button
              onClick={handlePrevMonth}
              title="Mes Anterior"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1 px-1.5 sm:px-2">
              <Calendar className="w-3.5 h-3.5 text-[#002060] hidden sm:inline" />
              <select
                value={month}
                onChange={(e) => onMonthYearChange(year, parseInt(e.target.value))}
                className="bg-transparent font-extrabold text-xs text-slate-900 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => onMonthYearChange(parseInt(e.target.value), month)}
                className="bg-transparent font-bold text-xs text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
            <button
              onClick={handleNextMonth}
              title="Mes Siguiente"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guardia Inicial */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-300 rounded-xl px-2 py-1 text-xs shrink-0">
            <span className="text-slate-500 font-medium text-[11px]">Día 1:</span>
            <select
              value={startGroup}
              onChange={(e) => setStartGroup(e.target.value)}
              className="bg-transparent font-extrabold text-[#002060] text-xs focus:outline-none cursor-pointer"
            >
              {GROUPS.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Search Filter */}
          <div className="relative flex-1 min-w-[160px] sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Right: Actions Buttons (Responsive Text on Mobile) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {Number(year) === 2026 && Number(month) === 9 && onLoadOfficial && (
            <button
              onClick={onLoadOfficial}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0"
              title="Cargar la distribución oficial exacta de Setiembre 2026 del hospital"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
              <span className="hidden sm:inline">Rol Oficial Setiembre</span>
              <span className="sm:hidden">Oficial</span>
            </button>
          )}

          <button
            onClick={onGenerate}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#002060] hover:bg-[#001848] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0"
            title="Genera automáticamente el rol mensual cumpliendo 2 enfermeros MT/N, 3 técnicos MT/N y 3 descansos"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Generar Automático</span>
            <span className="sm:hidden">Generar</span>
          </button>

          {onApplyGlobalFromDay && (
            <button
              onClick={() => setIsManualRotateOpen(!isManualRotateOpen)}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0 ${
                isManualRotateOpen
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-[#002060] border border-indigo-200'
              }`}
              title="Generar propuesta de rotación a partir de un día específico manteniendo intactos los días anteriores"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden md:inline">Rotar desde Día...</span>
              <span className="md:hidden">Rotar Día</span>
            </button>
          )}

          <button
            onClick={onExportExcel}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0"
            title="Descargar archivo Excel oficial con 2 hojas (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Descargar Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>

          <button
            onClick={onPrint}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1 sm:space-x-1.5 cursor-pointer shrink-0"
            title="Abrir vista previa del reporte oficial para imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Reporte PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={onClear}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer shrink-0"
            title="Limpiar turnos asignados del mes"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Manual Rotate Panel from a chosen day */}
      {isManualRotateOpen && onApplyGlobalFromDay && (
        <div className="p-3 sm:p-4 bg-indigo-50/90 border border-indigo-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                🔄
              </span>
              <span className="font-extrabold text-[#002060]">
                Proyectar Rotación del Servicio:
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-600 font-semibold">A partir del:</span>
              <select
                value={manualFromDay}
                onChange={(e) => setManualFromDay(Number(e.target.value))}
                className="bg-white border border-indigo-300 rounded-lg px-2.5 py-1 font-extrabold text-[#002060] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Día {d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-600 font-semibold">Guardia entra Día:</span>
              <select
                value={manualGroup}
                onChange={(e) => setManualGroup(e.target.value)}
                className="bg-white border border-indigo-300 rounded-lg px-2.5 py-1 font-extrabold text-[#002060] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {GROUPS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-indigo-700 hidden lg:inline">
              (Días 1 al {manualFromDay - 1} se mantienen intactos)
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => {
                onApplyGlobalFromDay(manualFromDay, manualGroup);
                setIsManualRotateOpen(false);
              }}
              className="px-3.5 py-1.5 bg-[#002060] hover:bg-[#001848] text-white font-extrabold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              Aplicar Rotación desde Día {manualFromDay}
            </button>
            <button
              type="button"
              onClick={() => setIsManualRotateOpen(false)}
              className="px-2 py-1 text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 3. Shift Schedule Info Banner / Comentario Oficial */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-extrabold text-[#002060] text-[11px] uppercase tracking-wider mr-0.5">
            Horarios:
          </span>

          {/* Turno Día */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 font-bold text-[11px] shadow-2xs">
            <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
              {displayStyle === 'D_N' ? 'D' : 'MT'}
            </span>
            <span>Día:</span>
            <span className="text-amber-800 font-extrabold bg-amber-100/80 px-1 rounded">
              8am - 8pm
            </span>
          </div>

          {/* Turno Noche */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-950 font-bold text-[11px] shadow-2xs">
            <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
              N
            </span>
            <span>Noche:</span>
            <span className="text-blue-800 font-extrabold bg-blue-100/80 px-1 rounded">
              8pm - 8am
            </span>
          </div>

          {/* Descanso */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
            <span>Descansos:</span>
            <span className="font-bold text-slate-800">3 días libres</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-500 text-[10px] sm:text-[11px]">
          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Autoguardado activo</span>
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <div className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="hidden md:inline">2 enf. y 3 téc. por turno. Clic en celda para cambiar turno y proyectar rotación.</span>
            <span className="md:hidden">2 enf. y 3 téc. por turno.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
