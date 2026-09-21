import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck, Building2, MapPin, Info } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../data/initialStaff.js';
import { getMonthDaysArray, getDaysInMonth } from '../services/schedulerEngine.js';
import { OFFICIAL_SEPTEMBER_MODIFICATIONS } from '../data/officialSeptSchedule.js';

const MONTH_NAMES_UPPER = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

export default function PdfReportModal({
  isOpen,
  onClose,
  staffList,
  schedule,
  year,
  month,
  clinicInfo,
  displayStyle = 'MT_N',
  onExportExcel
}) {
  if (!isOpen) return null;

  const daysArray = getMonthDaysArray(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const monthName = MONTH_NAMES_UPPER[month - 1];

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const nurses = activeStaff.filter(s => s.role === ROLES.ENFERMERO);
  const techs = activeStaff.filter(s => s.role === ROLES.TECNICO);

  const handlePrint = () => {
    window.print();
  };

  const renderSectionRows = (list, sectionTitle, roleLabel, targetCount, startIdx) => {
    let countIdx = startIdx;
    return (
      <>
        {/* Section Header Row */}
        <tr className="bg-slate-800 text-white font-bold text-[10px]">
          <td colSpan={5} className="px-2 py-1 uppercase tracking-wider text-left border border-slate-700">
            {sectionTitle} — (Cuota: {targetCount} Día / {targetCount} Noche)
          </td>
          <td colSpan={daysInMonth + 4} className="px-2 py-1 text-right text-slate-300 font-normal border border-slate-700">
            {list.length} colaboradores en servicio
          </td>
        </tr>

        {list.map((person) => {
          const personSchedule = schedule?.[person.id] || {};
          let countDay = 0;
          let countNight = 0;

          for (let d = 1; d <= daysInMonth; d++) {
            const s = personSchedule[d];
            if (s === 'MT') countDay++;
            else if (s === 'N') countNight++;
          }

          const totalGuardias = countDay + countNight;
          const totalHoras = totalGuardias * 12;

          return (
            <tr key={person.id} className="border-b border-slate-300 hover:bg-slate-50 text-[10px]">
              <td className="border border-slate-300 px-1 py-0.5 text-center font-mono text-slate-500">
                {countIdx++}
              </td>
              <td className="border border-slate-300 px-1.5 py-0.5 text-center font-mono font-bold text-slate-800">
                {person.documentId || '—'}
              </td>
              <td className="border border-slate-300 px-2 py-0.5 font-bold text-slate-900 truncate max-w-[200px]">
                {person.name}
              </td>
              <td className="border border-slate-300 px-1.5 py-0.5 text-slate-600 text-[9px] truncate">
                {roleLabel}
              </td>
              <td className="border border-slate-300 px-1 py-0.5 text-center font-bold text-slate-700">
                {person.group || 'G1'}
              </td>

              {/* Day cells */}
              {daysArray.map(d => {
                const shiftCode = personSchedule[d.dayNumber] || 'D';
                const isDay = shiftCode === 'MT';
                const isNight = shiftCode === 'N';
                const label = isDay ? (displayStyle === 'D_N' ? 'D' : 'MT') : (isNight ? 'N' : '');
                const isMod = Number(year) === 2026 && Number(month) === 9 && OFFICIAL_SEPTEMBER_MODIFICATIONS[person.id]?.includes(d.dayNumber);

                return (
                  <td
                    key={d.dayNumber}
                    className={`border border-slate-300 text-center py-0.5 font-black text-[10px] ${
                      isMod
                        ? 'bg-rose-100 text-rose-700 font-black'
                        : isDay
                        ? 'bg-amber-100/90 text-amber-950'
                        : isNight
                        ? 'bg-blue-100/90 text-blue-950'
                        : d.isWeekend
                        ? 'bg-slate-100/60 text-slate-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {label || (d.isWeekend ? '·' : '')}
                  </td>
                );
              })}

              {/* Stats */}
              <td className="border border-slate-300 px-1 py-0.5 text-center font-bold text-amber-900 bg-amber-50">
                {countDay}
              </td>
              <td className="border border-slate-300 px-1 py-0.5 text-center font-bold text-blue-900 bg-blue-50">
                {countNight}
              </td>
              <td className="border border-slate-300 px-1 py-0.5 text-center font-bold text-slate-900 bg-slate-100">
                {totalGuardias}
              </td>
              <td className="border border-slate-300 px-1 py-0.5 text-center font-black text-teal-900 bg-teal-50">
                {totalHoras}h
              </td>
            </tr>
          );
        })}

        {/* Subtotal Diurno */}
        <tr className="bg-amber-50/90 font-bold border-t border-amber-300 text-[9px] text-amber-950">
          <td colSpan={5} className="border border-slate-300 px-2 py-0.5 text-right font-extrabold">
            SUBTOTAL {roleLabel.toUpperCase()} DIURNO (8am-8pm) — Obj: {targetCount}:
          </td>
          {daysArray.map(d => {
            let count = 0;
            list.forEach(p => {
              if (schedule?.[p.id]?.[d.dayNumber] === 'MT') count++;
            });
            return (
              <td
                key={d.dayNumber}
                className={`border border-slate-300 text-center py-0.5 font-black ${
                  count === targetCount ? 'text-emerald-900 bg-emerald-100/70' : 'text-rose-900 bg-rose-200'
                }`}
              >
                {count}
              </td>
            );
          })}
          <td colSpan={4} className="border border-slate-300 bg-amber-50"></td>
        </tr>

        {/* Subtotal Nocturno */}
        <tr className="bg-blue-50/90 font-bold border-t border-blue-300 text-[9px] text-blue-950">
          <td colSpan={5} className="border border-slate-300 px-2 py-0.5 text-right font-extrabold">
            SUBTOTAL {roleLabel.toUpperCase()} NOCTURNO (8pm-8am) — Obj: {targetCount}:
          </td>
          {daysArray.map(d => {
            let count = 0;
            list.forEach(p => {
              if (schedule?.[p.id]?.[d.dayNumber] === 'N') count++;
            });
            return (
              <td
                key={d.dayNumber}
                className={`border border-slate-300 text-center py-0.5 font-black ${
                  count === targetCount ? 'text-emerald-900 bg-emerald-100/70' : 'text-rose-900 bg-rose-200'
                }`}
              >
                {count}
              </td>
            );
          })}
          <td colSpan={4} className="border border-slate-300 bg-blue-50"></td>
        </tr>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1500px] max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase">
                Vista Previa de Reporte Oficial • Rol Mensual {monthName} {year}
              </h2>
              <p className="text-[11px] text-slate-300">
                Formato institucional listo para Guardar como PDF o Imprimir en A4 Horizontal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={onExportExcel}
              className="px-2.5 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 sm:space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-sm transition-all flex items-center space-x-1 sm:space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Imprimir / Guardar PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Simulation Preview Container */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-200/80">
          <div className="sm:hidden text-center text-[11px] text-slate-600 mb-2 font-medium">
            👉 Desliza horizontalmente para ver la tabla completa
          </div>
          <div className="bg-white shadow-xl rounded-lg p-3 sm:p-6 max-w-full mx-auto border border-slate-300 text-slate-900 font-sans min-w-[700px]">
            {/* 1. Official Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-black tracking-widest text-[#002060] uppercase">
                    <span>HOSPITAL / CLÍNICA SAN BORJA</span>
                    <span>•</span>
                    <span>TORRE HOSPITALARIA</span>
                  </div>
                  <h1 className="text-base font-black uppercase text-slate-950 mt-0.5 tracking-tight">
                    ROL OFICIAL DE PROGRAMACIÓN MENSUAL DE TURNOS Y GUARDIAS
                  </h1>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-700 mt-1">
                    <span><strong>SERVICIO:</strong> {clinicInfo.area}</span>
                    <span>•</span>
                    <span><strong>MES:</strong> {monthName} {year}</span>
                    <span>•</span>
                    <span><strong>EMISIÓN:</strong> {new Date().toLocaleDateString('es-PE')}</span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-600 space-y-0.5 border-l border-slate-300 pl-3">
                  <div><strong>CÓDIGO:</strong> ROL-ENF-{year}-{String(month).padStart(2, '0')}</div>
                  <div><strong>ESTADO:</strong> PROGRAMADO OFICIAL</div>
                  <div><strong>PÁGINA:</strong> 1 de 1</div>
                </div>
              </div>

              {/* Shift hours banner */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 bg-slate-50 p-2 rounded text-[10px] text-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>NORMATIVA DE TURNOS:</strong>{' '}
                  <span className="bg-amber-100 text-amber-950 font-bold px-1 py-0.2 rounded border border-amber-300 mr-2">
                    Día ({displayStyle === 'D_N' ? 'D' : 'MT'}): 8:00 am a 8:00 pm (12h)
                  </span>
                  <span className="bg-blue-100 text-blue-950 font-bold px-1 py-0.2 rounded border border-blue-300 mr-2">
                    Noche (N): 8:00 pm a 8:00 am (12h)
                  </span>
                  <span className="text-slate-600 font-semibold">
                    Descansos: 3 días libres consecutivos tras guardia
                  </span>
                </div>
                <div className="text-slate-500 font-bold">
                  Cuota diaria: 2 Enfermeros + 3 Técnicos por turno
                </div>
              </div>
            </div>

            {/* 2. Official Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead>
                  {/* Row 1: Weekday Initials (M, M, J, V, S, D, L...) */}
                  <tr className="bg-[#1e3a8a] text-white border border-slate-400 text-[9px] font-bold">
                    <th className="border border-slate-400 px-1 py-1 w-6 text-center">N°</th>
                    <th className="border border-slate-400 px-1.5 py-1 w-16 text-center">DNI</th>
                    <th className="border border-slate-400 px-2 py-1 w-48 text-left">Apellidos y Nombres</th>
                    <th className="border border-slate-400 px-1 py-1 w-24 text-left">Cargo</th>
                    <th className="border border-slate-400 px-1 py-1 w-8 text-center">Grd</th>

                    {daysArray.map(d => (
                      <th
                        key={d.dayNumber}
                        className={`border border-slate-400 text-center py-0.5 w-6 ${
                          d.isWeekend ? 'bg-blue-950 text-amber-300' : 'text-white'
                        }`}
                      >
                        {d.dayName.slice(0, 1).toUpperCase()}
                      </th>
                    ))}

                    <th className="border border-slate-400 px-1 py-1 text-center w-8 bg-[#172554] text-amber-300">
                      {displayStyle === 'D_N' ? 'D' : 'MT'}
                    </th>
                    <th className="border border-slate-400 px-1 py-1 text-center w-8 bg-[#172554] text-blue-200">
                      N
                    </th>
                    <th className="border border-slate-400 px-1 py-1 text-center w-8 bg-[#172554] text-slate-200">
                      Tot
                    </th>
                    <th className="border border-slate-400 px-1 py-1 text-center w-10 bg-[#0f172a] text-teal-300">
                      Horas
                    </th>
                  </tr>

                  {/* Row 2: Day Numbers (1, 2, 3... 30/31) */}
                  <tr className="bg-[#002060] text-white border border-slate-400 text-[10px] font-extrabold">
                    <th colSpan={5} className="border border-slate-400 px-2 py-0.5 text-left text-[9px] text-blue-200 uppercase">
                      Distribución por Día del Mes
                    </th>

                    {daysArray.map(d => (
                      <th
                        key={d.dayNumber}
                        className={`border border-slate-400 text-center py-0.5 ${
                          d.isWeekend ? 'bg-blue-900 text-amber-300' : 'text-blue-100'
                        }`}
                      >
                        {d.dayNumber}
                      </th>
                    ))}

                    <th colSpan={4} className="border border-slate-400 bg-[#002060]"></th>
                  </tr>
                </thead>

                <tbody>
                  {/* Section I: Nurses */}
                  {renderSectionRows(nurses, 'I. PROFESIONALES EN ENFERMERÍA (LICENCIADOS)', 'Lic. Enfermería', 2, 1)}

                  {/* Section II: Internas Divider */}
                  <tr className="bg-slate-200 text-slate-700 font-bold border border-slate-300 text-[9px]">
                    <td colSpan={5} className="px-2 py-0.5 uppercase tracking-wider text-left border border-slate-300">
                      II. INTERNAS DE ENFERMERÍA
                    </td>
                    <td colSpan={daysInMonth + 4} className="px-2 py-0.5 text-slate-500 font-normal border border-slate-300">
                      Sin rol hospitalario obligatorio programado
                    </td>
                  </tr>

                  {/* Section III: Technicians */}
                  {renderSectionRows(techs, 'III. TÉCNICOS EN ENFERMERÍA', 'Téc. Enfermería', 3, nurses.length + 1)}

                  {/* Grand Consolidated Daily Total */}
                  <tr className="bg-slate-900 text-white font-extrabold text-[9px] border-t-2 border-slate-900">
                    <td colSpan={5} className="border border-slate-700 px-2 py-1 text-right uppercase tracking-wider">
                      TOTAL PERSONAL EN SERVICIO 24H (Obj: 10 = 4 Enf + 6 Tec):
                    </td>
                    {daysArray.map(d => {
                      let dayCount = 0;
                      activeStaff.forEach(p => {
                        const s = schedule?.[p.id]?.[d.dayNumber];
                        if (s === 'MT' || s === 'N') dayCount++;
                      });
                      const isComplete = dayCount === 10;
                      return (
                        <td
                          key={d.dayNumber}
                          className={`border border-slate-700 text-center py-1 font-black ${
                            isComplete ? 'text-emerald-400 bg-slate-800' : 'text-amber-400 bg-rose-950'
                          }`}
                        >
                          {dayCount}
                        </td>
                      );
                    })}
                    <td colSpan={4} className="border border-slate-700 text-center text-slate-400 font-normal">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Formal Signatures Block */}
            <div className="mt-8 pt-4 border-t border-slate-400 grid grid-cols-3 gap-8 text-center text-[10px]">
              <div>
                <div className="border-t border-slate-800 w-48 mx-auto pt-1 font-bold text-slate-900">
                  Lic. Coordinador(a) de Turnos
                </div>
                <div className="text-[9px] text-slate-500">Elaboración y Planificación</div>
                <div className="text-[8px] text-slate-400 mt-0.5">Firma y Sello</div>
              </div>

              <div>
                <div className="border-t border-slate-800 w-48 mx-auto pt-1 font-bold text-slate-900">
                  Lic. Jefatura de Enfermería
                </div>
                <div className="text-[9px] text-slate-500">Revisión y Conformidad</div>
                <div className="text-[8px] text-slate-400 mt-0.5">V° B° Aprobado</div>
              </div>

              <div>
                <div className="border-t border-slate-800 w-48 mx-auto pt-1 font-bold text-slate-900">
                  Dirección Médica / General
                </div>
                <div className="text-[9px] text-slate-500">Aprobación Final Institucional</div>
                <div className="text-[8px] text-slate-400 mt-0.5">Firma y Sello</div>
              </div>
            </div>

            {/* Document footer tip */}
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400">
              <span>Sistema de Turnos MediTurnos Pro • San Borja Torre Hospitalaria</span>
              <span>Documento de carácter legal y operativo para cumplimiento de turnos hospitalarios.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
