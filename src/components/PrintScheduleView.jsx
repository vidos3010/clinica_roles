import React from 'react';
import { ROLES, ROLE_LABELS } from '../data/initialStaff.js';
import { getMonthDaysArray, getDaysInMonth } from '../services/schedulerEngine.js';
import { OFFICIAL_SEPTEMBER_MODIFICATIONS } from '../data/officialSeptSchedule.js';

const MONTH_NAMES_UPPER = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

export default function PrintScheduleView({ staffList, schedule, year, month, clinicInfo = {}, displayStyle = 'MT_N' }) {
  const daysArray = getMonthDaysArray(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const monthName = MONTH_NAMES_UPPER[month - 1];

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const nurses = activeStaff.filter(s => s.role === ROLES.ENFERMERO);
  const techs = activeStaff.filter(s => s.role === ROLES.TECNICO);

  const renderPrintRows = (list, sectionTitle, roleLabel, targetCount, startIdx) => {
    let countIdx = startIdx;
    return (
      <>
        {/* Section title */}
        <tr className="bg-slate-200 text-black font-extrabold text-[9px]">
          <td colSpan={5} className="border border-black px-1.5 py-0.5 text-left uppercase">
            {sectionTitle} (Cuota: {targetCount} Día / {targetCount} Noche)
          </td>
          <td colSpan={daysInMonth + 4} className="border border-black px-1.5 py-0.5 text-right font-normal">
            {list.length} colaboradores
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
            <tr key={person.id} className="text-[9px] border-b border-slate-300">
              <td className="border border-black text-center py-0.5">{countIdx++}</td>
              <td className="border border-black text-center font-mono font-bold">{person.documentId || '-'}</td>
              <td className="border border-black px-1.5 py-0.5 font-bold truncate max-w-[190px]">{person.name}</td>
              <td className="border border-black px-1 py-0.5 text-[8px] truncate">{roleLabel}</td>
              <td className="border border-black text-center font-bold">{person.group || '-'}</td>

              {daysArray.map(d => {
                const shiftCode = personSchedule[d.dayNumber] || 'D';
                const isDay = shiftCode === 'MT';
                const isNight = shiftCode === 'N';
                const label = isDay ? (displayStyle === 'D_N' ? 'D' : 'MT') : (isNight ? 'N' : '');
                const isMod = Number(year) === 2026 && Number(month) === 9 && OFFICIAL_SEPTEMBER_MODIFICATIONS[person.id]?.includes(d.dayNumber);

                return (
                  <td
                    key={d.dayNumber}
                    className={`border border-black text-center py-0.5 font-black text-[9px] ${
                      isMod
                        ? 'bg-rose-100 text-rose-700'
                        : isDay
                        ? 'bg-amber-100 text-black'
                        : isNight
                        ? 'bg-blue-100 text-black'
                        : d.isWeekend
                        ? 'bg-slate-100'
                        : ''
                    }`}
                  >
                    {label}
                  </td>
                );
              })}

              <td className="border border-black text-center font-bold bg-amber-50">{countDay}</td>
              <td className="border border-black text-center font-bold bg-blue-50">{countNight}</td>
              <td className="border border-black text-center font-bold bg-slate-100">{totalGuardias}</td>
              <td className="border border-black text-center font-black bg-teal-50">{totalHoras}h</td>
            </tr>
          );
        })}

        {/* Subtotal Diurno */}
        <tr className="bg-slate-100 text-[8px] font-bold">
          <td colSpan={5} className="border border-black px-1 text-right font-bold">
            TOTAL {roleLabel.toUpperCase()} DÍA (8am-8pm):
          </td>
          {daysArray.map(d => {
            let count = 0;
            list.forEach(p => {
              if (schedule?.[p.id]?.[d.dayNumber] === 'MT') count++;
            });
            return (
              <td key={d.dayNumber} className="border border-black text-center py-0.5 font-black">
                {count}
              </td>
            );
          })}
          <td colSpan={4} className="border border-black bg-slate-100"></td>
        </tr>

        {/* Subtotal Nocturno */}
        <tr className="bg-slate-100 text-[8px] font-bold">
          <td colSpan={5} className="border border-black px-1 text-right font-bold">
            TOTAL {roleLabel.toUpperCase()} NOCHE (8pm-8am):
          </td>
          {daysArray.map(d => {
            let count = 0;
            list.forEach(p => {
              if (schedule?.[p.id]?.[d.dayNumber] === 'N') count++;
            });
            return (
              <td key={d.dayNumber} className="border border-black text-center py-0.5 font-black">
                {count}
              </td>
            );
          })}
          <td colSpan={4} className="border border-black bg-slate-100"></td>
        </tr>
      </>
    );
  };

  return (
    <div className="hidden print:block p-2 max-w-full bg-white text-black font-sans">
      {/* Header */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-slate-700">
          <span>HOSPITAL / CLÍNICA SAN BORJA • TORRE HOSPITALARIA</span>
          <span>CÓDIGO: ROL-ENF-{year}-{String(month).padStart(2, '0')}</span>
        </div>
        <h1 className="text-center text-sm font-black uppercase tracking-tight mt-0.5">
          ROL OFICIAL MENSUAL DE GUARDIAS Y TURNOS DE ENFERMERÍA — {monthName} {year}
        </h1>
        <div className="flex items-center justify-between text-[9px] text-slate-800 mt-1 border-t border-slate-300 pt-1">
          <span><strong>SERVICIO:</strong> {clinicInfo.area || 'HOSPITALIZACION 4TO PISO'}</span>
          <span><strong>HORARIOS:</strong> Turno Día = 8:00 am - 8:00 pm (12h) | Turno Noche = 8:00 pm - 8:00 am (12h) | Descanso = 3 días</span>
          <span><strong>EMISIÓN:</strong> {new Date().toLocaleDateString('es-PE')}</span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black text-[9px]">
        <thead>
          <tr className="bg-slate-200 text-black font-bold text-[8px]">
            <th className="border border-black px-0.5 py-0.5 w-5 text-center">N°</th>
            <th className="border border-black px-1 py-0.5 w-14 text-center">DNI</th>
            <th className="border border-black px-1.5 py-0.5 w-44 text-left">Apellidos y Nombres</th>
            <th className="border border-black px-1 py-0.5 w-20 text-left">Cargo</th>
            <th className="border border-black px-0.5 py-0.5 w-6 text-center">Grd</th>

            {daysArray.map(d => (
              <th
                key={d.dayNumber}
                className={`border border-black text-center py-0.5 ${
                  d.isWeekend ? 'bg-slate-300 font-black' : ''
                }`}
              >
                <div>{d.dayName.slice(0, 1)}</div>
                <div className="font-extrabold">{d.dayNumber}</div>
              </th>
            ))}

            <th className="border border-black px-0.5 py-0.5 text-center w-7">Día</th>
            <th className="border border-black px-0.5 py-0.5 text-center w-7">Noc</th>
            <th className="border border-black px-0.5 py-0.5 text-center w-7">Tot</th>
            <th className="border border-black px-1 py-0.5 text-center w-8">Horas</th>
          </tr>
        </thead>
        <tbody>
          {renderPrintRows(nurses, 'I. PROFESIONALES EN ENFERMERÍA (LICENCIADOS)', 'Lic. Enfermería', 2, 1)}

          <tr className="bg-slate-100 text-black font-bold text-[8px]">
            <td colSpan={5} className="border border-black px-1 py-0.5 uppercase">II. INTERNAS DE ENFERMERÍA</td>
            <td colSpan={daysInMonth + 4} className="border border-black px-1 py-0.5 text-slate-500 font-normal">Sin rotación obligatoria</td>
          </tr>

          {renderPrintRows(techs, 'III. TÉCNICOS EN ENFERMERÍA', 'Téc. Enfermería', 3, nurses.length + 1)}

          {/* Total 24h */}
          <tr className="bg-slate-300 text-black font-extrabold text-[8px] border-t-2 border-black">
            <td colSpan={5} className="border border-black px-1 py-0.5 text-right uppercase">
              TOTAL PERSONAL EN SERVICIO 24H (Obj: 10):
            </td>
            {daysArray.map(d => {
              let dayCount = 0;
              activeStaff.forEach(p => {
                const s = schedule?.[p.id]?.[d.dayNumber];
                if (s === 'MT' || s === 'N') dayCount++;
              });
              return (
                <td key={d.dayNumber} className="border border-black text-center py-0.5 font-black">
                  {dayCount}
                </td>
              );
            })}
            <td colSpan={4} className="border border-black text-center">100%</td>
          </tr>
        </tbody>
      </table>

      {/* 3 Formal Signatures */}
      <div className="mt-8 pt-2 grid grid-cols-3 gap-8 text-center text-[9px]">
        <div>
          <div className="border-t border-black w-40 mx-auto pt-0.5 font-bold">
            Lic. Coordinador(a) de Turnos
          </div>
          <div className="text-[8px] text-slate-600">Elaboración y Rol</div>
          <div className="text-[7px] text-slate-400">Firma y Sello</div>
        </div>
        <div>
          <div className="border-t border-black w-40 mx-auto pt-0.5 font-bold">
            Lic. Jefatura de Enfermería
          </div>
          <div className="text-[8px] text-slate-600">Revisión y Conformidad</div>
          <div className="text-[7px] text-slate-400">V° B° Aprobado</div>
        </div>
        <div>
          <div className="border-t border-black w-40 mx-auto pt-0.5 font-bold">
            Dirección Médica / General
          </div>
          <div className="text-[8px] text-slate-600">Aprobación Institucional</div>
          <div className="text-[7px] text-slate-400">Firma y Sello</div>
        </div>
      </div>
    </div>
  );
}
