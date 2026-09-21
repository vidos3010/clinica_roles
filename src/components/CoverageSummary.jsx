import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Clock, Users, Calendar } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../data/initialStaff.js';
import { calculateDailyCoverage, calculateStaffStatistics, getMonthDaysArray, getDaysInMonth } from '../services/schedulerEngine.js';

export default function CoverageSummary({ staffList, schedule, year, month, onOpenReplacementAssistant }) {
  const coverage = calculateDailyCoverage(staffList, schedule, year, month);
  const stats = calculateStaffStatistics(staffList, schedule, year, month);
  const daysArray = getMonthDaysArray(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const nurses = activeStaff.filter(s => s.role === ROLES.ENFERMERO);
  const techs = activeStaff.filter(s => s.role === ROLES.TECNICO);

  // Totals
  const fullyCoveredDays = coverage.filter(c => c.isFullyCovered).length;
  const coveragePercent = Math.round((fullyCoveredDays / daysInMonth) * 100);

  // Total hospital hours
  let totalHoursAll = 0;
  Object.values(stats).forEach(s => totalHoursAll += s.totalHoras);
  const avgHoursPerPerson = activeStaff.length > 0 ? Math.round(totalHoursAll / activeStaff.length) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumplimiento de Turnos</span>
            {coveragePercent === 100 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${coveragePercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {coveragePercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({fullyCoveredDays} de {daysInMonth} días óptimos)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${coveragePercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${coveragePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Nurses quota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuota Enfermeros</span>
            <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">2 MT / 2 N</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-teal-700">{nurses.length}</span>
            <span className="text-xs text-slate-500">enfermeros activos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {nurses.length >= 10 ? 'Plantilla suficiente para rotación 3D' : '⚠️ Se requieren al menos 10 para cobertura continua'}
          </p>
        </div>

        {/* Techs quota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuota Técnicos</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">3 MT / 3 N</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-700">{techs.length}</span>
            <span className="text-xs text-slate-500">técnicos activos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {techs.length >= 15 ? 'Plantilla suficiente para rotación 3D' : '⚠️ Se requieren al menos 15 para cobertura continua'}
          </p>
        </div>

        {/* Average workload */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga Laboral Media</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-800">{avgHoursPerPerson}</span>
            <span className="text-xs text-slate-500">horas / colaborador</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Aprox. {Math.round(avgHoursPerPerson / 12)} guardias de 12 horas al mes
          </p>
        </div>
      </div>

      {/* Daily Coverage Calendar Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Validación Diaria de Turnos del Mes
            </h3>
            <p className="text-xs text-slate-500">
              Verifica que cada día cumpla con 2 enfermeros (MT/N) y 3 técnicos (MT/N).
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Completo</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Déficit</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-2.5 pt-2">
          {coverage.map((cov, idx) => {
            const dayInfo = daysArray[idx] || { dayName: '—', isWeekend: false };
            const isOk = cov.isFullyCovered;

            return (
              <div
                key={cov.day}
                className={`p-2.5 rounded-xl border transition-all text-xs ${
                  isOk
                    ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                    : 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-200/50">
                  <span className={`${dayInfo.isWeekend ? 'text-amber-800' : 'text-slate-700'}`}>
                    Día {cov.day} <span className="text-[10px] font-normal text-slate-400">({dayInfo.dayName})</span>
                  </span>
                  {isOk ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>

                <div className="mt-2 space-y-1 text-[11px]">
                  {/* Enfermeros */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Enfermeros:</span>
                    <span className={`font-semibold ${cov.enfermeros.isComplete ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                      MT:{cov.enfermeros.mt}/2 • N:{cov.enfermeros.n}/2
                    </span>
                  </div>

                  {/* Técnicos */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Técnicos:</span>
                    <span className={`font-semibold ${cov.tecnicos.isComplete ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                      MT:{cov.tecnicos.mt}/3 • N:{cov.tecnicos.n}/3
                    </span>
                  </div>

                  {/* Quick button to open Replacement Assistant if deficit */}
                  {!isOk && onOpenReplacementAssistant && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!cov.enfermeros.isComplete) {
                          const shift = cov.enfermeros.mt < 2 ? 'MT' : 'N';
                          const count = cov.enfermeros.mt < 2 ? cov.enfermeros.mt : cov.enfermeros.n;
                          onOpenReplacementAssistant({
                            dayNumber: cov.day,
                            role: ROLES.ENFERMERO,
                            shift,
                            currentCount: count,
                            targetCount: 2,
                            reason: `Déficit detectado en reporte de métricas (${count}/2 Licenciados)`
                          });
                        } else if (!cov.tecnicos.isComplete) {
                          const shift = cov.tecnicos.mt < 3 ? 'MT' : 'N';
                          const count = cov.tecnicos.mt < 3 ? cov.tecnicos.mt : cov.tecnicos.n;
                          onOpenReplacementAssistant({
                            dayNumber: cov.day,
                            role: ROLES.TECNICO,
                            shift,
                            currentCount: count,
                            targetCount: 3,
                            reason: `Déficit detectado en reporte de métricas (${count}/3 Técnicos)`
                          });
                        }
                      }}
                      className="w-full mt-2 py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black shadow-xs cursor-pointer flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>⚡ Cubrir Vacante</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff individual workload ranking table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Resumen de Horas y Guardias por Colaborador
          </h3>
          <span className="text-xs text-slate-500">
            Distribución equitativa de turnos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">Colaborador</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3 text-center">Guardia</th>
                <th className="px-4 py-3 text-center">Turnos MT (Diurno)</th>
                <th className="px-4 py-3 text-center">Turnos N (Nocturno)</th>
                <th className="px-4 py-3 text-center">Días Descanso</th>
                <th className="px-4 py-3 text-center">Total Guardias</th>
                <th className="px-6 py-3 text-right">Total Horas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStaff.map(person => {
                const s = stats[person.id] || { countMT: 0, countN: 0, countD: 0, totalGuardias: 0, totalHoras: 0 };
                return (
                  <tr key={person.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-semibold text-slate-800">{person.name}</div>
                      <div className="text-[10px] text-slate-400">DNI: {person.documentId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                        person.role === ROLES.ENFERMERO ? 'bg-teal-50 text-teal-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {ROLE_LABELS[person.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {person.group || 'G1'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-amber-800">
                      {s.countMT}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-indigo-800">
                      {s.countN}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">
                      {s.countD}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {s.totalGuardias}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-teal-700 text-sm">
                      {s.totalHoras} hrs
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
