import React, { useMemo } from 'react';
import { 
  Users, 
  Check, 
  X, 
  Sun, 
  Moon, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Coffee, 
  Sparkles, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { findOptimalReplacements } from '../services/schedulerEngine.js';
import { ROLES } from '../data/initialStaff.js';

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ReplacementAssistantModal({
  isOpen,
  onClose,
  deficitData,
  staffList,
  schedule,
  year,
  month,
  displayStyle = 'MT_N',
  onAssignReplacement
}) {
  if (!isOpen || !deficitData) return null;

  const { dayNumber, role, shift, currentCount, targetCount, reason } = deficitData;

  const isNurse = role === ROLES.ENFERMERO;
  const isDay = shift === 'MT';
  const roleName = isNurse ? 'Lic. en Enfermería' : 'Téc. de Enfermería';
  const shiftName = isDay ? 'Turno Día (8:00 am - 8:00 pm)' : 'Turno Noche (8:00 pm - 8:00 am)';
  const shiftCodeLabel = isDay ? (displayStyle === 'D_N' ? 'D' : 'MT') : 'N';

  // Compute optimal ranked replacement candidates
  const candidates = useMemo(() => {
    return findOptimalReplacements(staffList, schedule, year, month, dayNumber, shift, role);
  }, [staffList, schedule, year, month, dayNumber, shift, role]);

  const handleSelectCandidate = (candidate) => {
    if (candidate.tier === 'FATIGUE_RISK') {
      if (!confirm(`⚠️ Atención: ${candidate.person.name} salió de Turno Noche el día anterior. ¿Deseas asignarlo de todos modos bajo tu autorización?`)) {
        return;
      }
    }
    onAssignReplacement(candidate.person.id, dayNumber, shift);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001848] via-[#002060] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded uppercase tracking-wider">
                  Asistente de Reemplazo
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  Día {dayNumber} de {MONTH_NAMES_ES[month - 1]} {year}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Cubrir Vacante de {roleName}
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
          {/* Deficit Alert Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-2xs">
                {isDay ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-black text-slate-950 text-sm">
                  Déficit en {shiftName}
                </p>
                <p className="text-xs text-amber-900 mt-0.5 font-medium">
                  Se requieren <strong>{targetCount} {roleName}s</strong> por regla del hospital. Actualmente hay <strong>{currentCount}</strong> asignado(s).
                </p>
                {reason && (
                  <p className="text-[11px] text-amber-800 italic mt-1">
                    Motivo: {reason}
                  </p>
                )}
              </div>
            </div>

            <div className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-amber-200/80 border border-amber-400 text-amber-950 font-black text-xs shrink-0">
              Falta: {targetCount - currentCount} cupo(s)
            </div>
          </div>

          {/* Ranking Info Text */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Candidatos Disponibles en Descanso (Ordenados por Idoneidad):</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Filtro: Mayor descanso previo + Menos horas en el mes
            </span>
          </div>

          {/* Candidates List */}
          {candidates.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-slate-700">No hay colaboradores en descanso disponibles para este día.</p>
              <p className="text-xs text-slate-500">Todos los colaboradores del rol están asignados a guardia o con descanso médico/vacaciones.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {candidates.map((cand, idx) => {
                const isTop = cand.tier === 'TOP_RECOMMENDED';
                const isRisk = cand.tier === 'FATIGUE_RISK';
                const cardBorder = isTop 
                  ? 'border-2 border-emerald-500 bg-emerald-50/30' 
                  : isRisk 
                  ? 'border border-rose-200 bg-rose-50/20' 
                  : 'border border-slate-200 bg-white hover:bg-slate-50';

                return (
                  <div 
                    key={cand.person.id}
                    className={`rounded-2xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${cardBorder}`}
                  >
                    {/* Left: Info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {cand.person.name}
                        </span>
                        <span className="px-2 py-0.2 rounded font-black text-[10px] bg-slate-100 text-[#002060] border border-slate-200">
                          {cand.person.group || 'G1'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] shadow-2xs ${
                          isTop 
                            ? 'bg-emerald-600 text-white' 
                            : isRisk 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {cand.badge}
                        </span>
                      </div>

                      {/* Metrics Strip */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 pt-0.5">
                        <div className="flex items-center space-x-1">
                          <Coffee className="w-3.5 h-3.5 text-slate-400" />
                          <span>Descanso previo:</span>
                          <strong className="text-slate-800">{cand.consecutiveRestDays} días libres</strong>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Horas en el mes:</span>
                          <strong className="text-slate-800">{cand.totalHoras}h ({cand.totalGuardias} guardias)</strong>
                        </div>
                      </div>

                      {/* Warnings if any */}
                      {cand.warnings.length > 0 && (
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-rose-700 pt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{cand.warnings.join(' • ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Action Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectCandidate(cand)}
                      className={`px-3.5 py-2 rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 self-start sm:self-center ${
                        isTop 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                          : isRisk 
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300' 
                          : 'bg-[#002060] hover:bg-[#001848] text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Asignar {shiftCodeLabel}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Al asignar el reemplazo, el rol se actualiza y guarda automáticamente.</span>
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
