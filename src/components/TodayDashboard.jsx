import React, { useState, useEffect } from 'react';
import { Sun, Moon, Calendar, Clock, ChevronLeft, ChevronRight, UserCheck, ShieldCheck, Phone, ArrowRight, Building2, MapPin, Coffee, AlertCircle } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../data/initialStaff.js';
import { getDaysInMonth } from '../services/schedulerEngine.js';

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function TodayDashboard({
  staffList,
  schedule,
  year,
  month,
  clinicInfo,
  onNavigateToSchedule,
  onMonthYearChange
}) {
  const realToday = new Date();
  const [selectedDay, setSelectedDay] = useState(() => {
    if (year === realToday.getFullYear() && month === (realToday.getMonth() + 1)) {
      return realToday.getDate();
    }
    return 15; // default
  });

  const [currentHour, setCurrentHour] = useState(realToday.getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const safeDay = Math.min(Math.max(1, selectedDay), daysInMonth);

  const dateObj = new Date(year, month - 1, safeDay);
  const dayOfWeekName = DAY_NAMES_ES[dateObj.getDay()];
  const monthName = MONTH_NAMES_ES[month - 1];

  const isCurrentlyDayShift = currentHour >= 8 && currentHour < 20;

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');

  const dayNurses = [];
  const dayTechs = [];
  const nightNurses = [];
  const nightTechs = [];
  const restingStaff = [];
  const specialLeaveStaff = [];

  activeStaff.forEach(person => {
    const shift = schedule?.[person.id]?.[safeDay] || 'D';
    if (shift === 'MT') {
      if (person.role === ROLES.ENFERMERO) dayNurses.push(person);
      else dayTechs.push(person);
    } else if (shift === 'N') {
      if (person.role === ROLES.ENFERMERO) nightNurses.push(person);
      else nightTechs.push(person);
    } else if (shift === 'VAC' || shift === 'DM') {
      specialLeaveStaff.push({ ...person, leaveType: shift });
    } else {
      restingStaff.push(person);
    }
  });

  const dayGroup = dayNurses[0]?.group || dayTechs[0]?.group || '—';
  const nightGroup = nightNurses[0]?.group || nightTechs[0]?.group || '—';

  const handlePrevDay = () => {
    if (safeDay > 1) {
      setSelectedDay(safeDay - 1);
    } else {
      if (month === 1) {
        onMonthYearChange(year - 1, 12);
        setSelectedDay(31);
      } else {
        const prevMonthDays = getDaysInMonth(year, month - 1);
        onMonthYearChange(year, month - 1);
        setSelectedDay(prevMonthDays);
      }
    }
  };

  const handleNextDay = () => {
    if (safeDay < daysInMonth) {
      setSelectedDay(safeDay + 1);
    } else {
      if (month === 12) {
        onMonthYearChange(year + 1, 1);
        setSelectedDay(1);
      } else {
        onMonthYearChange(year, month + 1);
        setSelectedDay(1);
      }
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    onMonthYearChange(today.getFullYear(), today.getMonth() + 1);
    setSelectedDay(today.getDate());
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header Hero Card with Live Shift Status */}
      <div className="bg-gradient-to-r from-[#001848] via-[#002060] to-[#1e3a8a] text-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                Guardia del Día
              </span>
              <div className="flex items-center space-x-1 text-xs text-blue-200">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span className="font-semibold text-[11px] sm:text-xs">{clinicInfo.sede}</span>
              </div>
              <span className="text-blue-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1 text-xs text-blue-200">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-semibold text-[11px] sm:text-xs">{clinicInfo.area}</span>
              </div>
            </div>

            <div className="pt-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                {dayOfWeekName}, {safeDay} de {monthName} de {year}
              </h1>
            </div>

            <p className="text-[11px] sm:text-xs text-blue-200">
              Personal asignado a turnos de 12 horas: <strong>2 enfermeros</strong> y <strong>3 técnicos</strong> por turno.
            </p>
          </div>

          {/* Date Picker & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">
            <div className="flex items-center bg-white/10 p-1 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
              <button
                onClick={handlePrevDay}
                title="Día Anterior"
                className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs font-black text-amber-300">
                Día {safeDay} / {daysInMonth}
              </span>
              <button
                onClick={handleNextDay}
                title="Día Siguiente"
                className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleGoToToday}
              className="px-3 py-1.5 sm:py-2 bg-white text-[#002060] hover:bg-blue-50 text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              Ir a Hoy
            </button>

            <button
              onClick={onNavigateToSchedule}
              className="px-3.5 py-1.5 sm:py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>Ver Rol</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Two Shift Columns: Turno Día (8am-8pm) & Turno Noche (8pm-8am) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* COLUMNA 1: TURNO DÍA */}
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">Turno Día</h2>
                  <span className="bg-white text-amber-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-2xs">
                    Guardia {dayGroup}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-100 font-semibold">
                  8:00 am a 8:00 pm (12h)
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            {isCurrentlyDayShift ? (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full animate-pulse shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>EN SERVICIO</span>
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-amber-200 font-bold bg-white/10 px-2 py-0.5 rounded-lg">
                Diurno
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
            {/* Section A: Enfermeros Profesionales (2) */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0"></span>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Licenciados en Enfermería ({dayNurses.length}/2)
                  </h3>
                </div>
                {dayNurses.length === 2 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Cuota (2)</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    ⚠️ {dayNurses.length}/2
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-2">
                {dayNurses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay enfermeros programados para este turno.</p>
                ) : (
                  dayNurses.map(person => (
                    <div
                      key={person.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                          ENF
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={person.name}>
                            {person.name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                            DNI: <strong className="text-slate-700">{person.documentId}</strong> • Grd: <span className="font-bold text-[#002060]">{person.group}</span>
                          </div>
                        </div>
                      </div>
                      {person.phone && (
                        <div className="self-start sm:self-auto flex items-center space-x-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                          <Phone className="w-3 h-3 text-teal-600" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section B: Técnicos en Enfermería (3) */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Técnicos de Enfermería ({dayTechs.length}/3)
                  </h3>
                </div>
                {dayTechs.length === 3 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Cuota (3)</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ⚠️ {dayTechs.length}/3
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-2">
                {dayTechs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay técnicos programados para este turno.</p>
                ) : (
                  dayTechs.map(person => (
                    <div
                      key={person.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                          TEC
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={person.name}>
                            {person.name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                            DNI: <strong className="text-slate-700">{person.documentId}</strong> • Grd: <span className="font-bold text-[#002060]">{person.group}</span>
                          </div>
                        </div>
                      </div>
                      {person.phone && (
                        <div className="self-start sm:self-auto flex items-center space-x-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Footer Banner */}
            <div className="bg-amber-50 p-2.5 sm:p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-950">
              <span>Total en Turno Día:</span>
              <span className="text-sm font-black text-amber-900">
                {dayNurses.length + dayTechs.length} personas
              </span>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: TURNO NOCHE */}
        <div className="bg-white rounded-2xl border-2 border-blue-300 shadow-sm overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">Turno Noche</h2>
                  <span className="bg-white text-blue-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-2xs">
                    Guardia {nightGroup}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-blue-100 font-semibold">
                  8:00 pm a 8:00 am (12h)
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            {!isCurrentlyDayShift ? (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full animate-pulse shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>EN SERVICIO</span>
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-blue-200 font-bold bg-white/10 px-2 py-0.5 rounded-lg">
                Próximo Turno
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
            {/* Section A: Enfermeros Profesionales (2) */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0"></span>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Licenciados en Enfermería ({nightNurses.length}/2)
                  </h3>
                </div>
                {nightNurses.length === 2 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Cuota (2)</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    ⚠️ {nightNurses.length}/2
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-2">
                {nightNurses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay enfermeros programados para este turno.</p>
                ) : (
                  nightNurses.map(person => (
                    <div
                      key={person.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                          ENF
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={person.name}>
                            {person.name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                            DNI: <strong className="text-slate-700">{person.documentId}</strong> • Grd: <span className="font-bold text-[#002060]">{person.group}</span>
                          </div>
                        </div>
                      </div>
                      {person.phone && (
                        <div className="self-start sm:self-auto flex items-center space-x-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                          <Phone className="w-3 h-3 text-teal-600" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section B: Técnicos en Enfermería (3) */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Técnicos de Enfermería ({nightTechs.length}/3)
                  </h3>
                </div>
                {nightTechs.length === 3 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Cuota (3)</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ⚠️ {nightTechs.length}/3
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-2">
                {nightTechs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay técnicos programados para este turno.</p>
                ) : (
                  nightTechs.map(person => (
                    <div
                      key={person.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                          TEC
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={person.name}>
                            {person.name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                            DNI: <strong className="text-slate-700">{person.documentId}</strong> • Grd: <span className="font-bold text-[#002060]">{person.group}</span>
                          </div>
                        </div>
                      </div>
                      {person.phone && (
                        <div className="self-start sm:self-auto flex items-center space-x-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Footer Banner */}
            <div className="bg-blue-50 p-2.5 sm:p-3 rounded-xl border border-blue-200 flex items-center justify-between text-xs font-bold text-blue-950">
              <span>Total en Turno Noche:</span>
              <span className="text-sm font-black text-blue-900">
                {nightNurses.length + nightTechs.length} personas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Summary: Staff on Rest / Leave today */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-slate-500 shrink-0" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Personal en Descanso / Libre Hoy ({restingStaff.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            3 días reglamentarios de descanso
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-3">
          {restingStaff.map(person => (
            <div
              key={person.id}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
            >
              <div className="font-bold text-slate-800 truncate text-[11px] sm:text-xs" title={person.name}>
                {person.name}
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] sm:text-[11px] text-slate-500">
                <span className="truncate">{person.role === ROLES.ENFERMERO ? 'Enf.' : 'Téc.'}</span>
                <span className="font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                  {person.group}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
