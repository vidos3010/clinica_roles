import React, { useMemo, useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  User, 
  ArrowRight, 
  Check, 
  X, 
  RotateCw, 
  Users, 
  Sun, 
  Moon, 
  Coffee, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { projectStaffRotationFromDay, GROUPS } from '../services/schedulerEngine.js';

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function RotationProposalModal({
  isOpen,
  onClose,
  proposalData,
  year,
  month,
  totalDays,
  displayStyle = 'MT_N',
  onApplyIndividual,
  onApplyGlobalFromDay,
  onKeepSingleDay
}) {
  if (!isOpen || !proposalData) return null;

  const { staff, dayNumber, newShift, oldShift } = proposalData;
  const [selectedStartGroup, setSelectedStartGroup] = useState(staff?.group || 'G1');

  // Compute individual projection from dayNumber to totalDays
  const individualProjection = useMemo(() => {
    return projectStaffRotationFromDay(newShift, dayNumber, totalDays);
  }, [newShift, dayNumber, totalDays]);

  const projectedDaysArray = useMemo(() => {
    const arr = [];
    for (let d = dayNumber; d <= Math.min(dayNumber + 9, totalDays); d++) {
      arr.push({
        day: d,
        shift: individualProjection[d] || 'D'
      });
    }
    return arr;
  }, [individualProjection, dayNumber, totalDays]);

  const getShiftBadge = (shiftCode) => {
    const isDay = shiftCode === 'MT' || shiftCode === 'D';
    const isNight = shiftCode === 'N';
    const isRest = shiftCode === 'D' || shiftCode === 'LIBRE';
    const isVac = shiftCode === 'VAC';
    const isDm = shiftCode === 'DM';

    if (isDay && shiftCode !== 'D') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-black text-xs bg-amber-100 text-amber-950 border border-amber-300">
          <Sun className="w-3 h-3 text-amber-600" />
          <span>{displayStyle === 'D_N' ? 'D' : 'MT'}</span>
        </span>
      );
    }
    if (isNight) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-black text-xs bg-blue-100 text-blue-950 border border-blue-300">
          <Moon className="w-3 h-3 text-blue-600" />
          <span>N</span>
        </span>
      );
    }
    if (isVac) {
      return <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-100 text-emerald-900 border border-emerald-300">VAC</span>;
    }
    if (isDm) {
      return <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-rose-100 text-rose-900 border border-rose-300">DM</span>;
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700 border border-slate-300">
        <Coffee className="w-3 h-3 text-slate-400" />
        <span>D</span>
      </span>
    );
  };

  const handleApplyIndividual = () => {
    onApplyIndividual(staff.id, individualProjection);
    onClose();
  };

  const handleApplyGlobal = () => {
    onApplyGlobalFromDay(dayNumber, selectedStartGroup);
    onClose();
  };

  const handleKeepOnlySingleDay = () => {
    onKeepSingleDay();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#001848] via-[#002060] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded uppercase tracking-wider">
                  Asistente Inteligente
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  {MONTH_NAMES_ES[month - 1]} {year}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Propuesta de Rotación a partir del Día {dayNumber}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Change Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center shrink-0">
                {staff?.role === 'ENFERMERO' ? 'LE' : 'TE'}
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{staff?.name}</p>
                <p className="text-xs text-slate-500">
                  {staff?.role === 'ENFERMERO' ? 'Lic. en Enfermería' : 'Téc. de Enfermería'} • Guardia: <span className="font-bold text-[#002060]">{staff?.group || 'G1'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Día {dayNumber}:</span>
              <span className="line-through text-slate-400 font-bold">{oldShift || 'D'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              {getShiftBadge(newShift)}
            </div>
          </div>

          {/* Visual Sequence Preview from Day X */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 sm:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <RotateCw className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  Secuencia del Ciclo Proyectado (Día {dayNumber} al {totalDays})
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                MT ➔ N ➔ 3D
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Si aplicas la rotación, el ciclo hospitalario continuará automáticamente respetando <strong>1 guardia día, 1 noche y 3 días de descanso libre</strong>:
            </p>

            {/* Micro Day Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {projectedDaysArray.map(({ day, shift }) => {
                const isStart = day === dayNumber;
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg border text-center min-w-[42px] ${
                      isStart 
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/40 shadow-xs' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold text-slate-500">Día {day}</span>
                    <span className={`text-xs font-black mt-0.5 ${
                      shift === 'MT' ? 'text-amber-700' : shift === 'N' ? 'text-indigo-700' : 'text-slate-600'
                    }`}>
                      {shift === 'MT' && displayStyle === 'D_N' ? 'D' : shift}
                    </span>
                  </div>
                );
              })}
              {totalDays > dayNumber + 9 && (
                <div className="flex items-center justify-center px-2 py-1 text-slate-400 text-xs font-bold">
                  ...hasta día {totalDays}
                </div>
              )}
            </div>
          </div>

          {/* Action Options Cards */}
          <div className="space-y-2.5">
            <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Elige cómo deseas aplicar este cambio:
            </p>

            {/* Option 1: Apply to this staff member (RECOMMENDED) */}
            <div 
              onClick={handleApplyIndividual}
              className="group p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition-all cursor-pointer flex items-start justify-between gap-3 shadow-xs hover:shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Opción Recomendada
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    1. Aplicar Rotación a {staff?.name}
                  </p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Proyecta la secuencia continua (Día ➔ Noche ➔ 3 Descansos) desde el <strong>Día {dayNumber} hasta el {totalDays}</strong> solo para este colaborador. Los días del 1 al {dayNumber - 1} y los demás compañeros permanecen intactos.
                </p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0 flex items-center space-x-1 cursor-pointer transition-colors mt-1"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a {staff?.name.split(' ')[0]}</span>
              </button>
            </div>

            {/* Option 2: Recalculate whole ward from day X */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 hover:bg-blue-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-[#002060]" />
                  <span>2. Regenerar Rotación de Todo el Servicio desde el Día {dayNumber}</span>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Congela los días 1 al {dayNumber - 1} y recalcula la rotación completa del 4to Piso desde el Día {dayNumber} garantizando cobertura exacta (2 enfermeros y 3 técnicos).
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-xs font-bold text-slate-600">Guardia que entra de Día ({displayStyle === 'D_N' ? 'D' : 'MT'}) en Día {dayNumber}:</span>
                  <select
                    value={selectedStartGroup}
                    onChange={(e) => setSelectedStartGroup(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 font-bold text-xs text-[#002060] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyGlobal}
                className="px-3 py-1.5 bg-[#002060] hover:bg-[#001848] text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0 flex items-center space-x-1 cursor-pointer transition-colors self-start sm:self-center"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerar Servicio</span>
              </button>
            </div>

            {/* Option 3: Keep only single day */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800 text-xs">
                  3. Solo cambiar este día puntual (Día {dayNumber})
                </p>
                <p className="text-[11px] text-slate-500">
                  Mantener únicamente el cambio en la celda del Día {dayNumber} sin alterar ningún otro día posterior.
                </p>
              </div>
              <button
                type="button"
                onClick={handleKeepOnlySingleDay}
                className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Conservar Solo Día {dayNumber}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Tu modificación del Día {dayNumber} ya fue guardada automáticamente.</span>
            <span className="sm:hidden">Día {dayNumber} guardado automáticamente.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
