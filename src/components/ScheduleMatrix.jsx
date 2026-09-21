import React, { useState, useRef, useEffect } from 'react';
import { ROLES, SHIFTS } from '../data/initialStaff.js';
import { getMonthDaysArray, getDaysInMonth } from '../services/schedulerEngine.js';
import { OFFICIAL_SEPTEMBER_MODIFICATIONS } from '../data/officialSeptSchedule.js';
import { Sun, Moon, Calendar, X, ArrowRight } from 'lucide-react';

export default function ScheduleMatrix({
  staffList,
  schedule,
  year,
  month,
  displayStyle = 'D_N', // 'D_N' or 'MT_N'
  colorTheme = 'classic', // 'classic' or 'modern'
  density = 'compact',   // 'compact' or 'comfortable'
  searchFilter = '',
  onUpdateShift,
  onOpenReplacementAssistant
}) {
  const daysArray = getMonthDaysArray(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  // Responsive mobile detector (< 640px)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Today indicator
  const realToday = new Date();
  const isCurrentMonth = year === realToday.getFullYear() && month === (realToday.getMonth() + 1);
  const realTodayDate = realToday.getDate();

  // Crosshair coordinates { staffId, dayNumber }
  const [hoveredCell, setHoveredCell] = useState(null);
  const [activePicker, setActivePicker] = useState(null);
  const popoverRef = useRef(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePicker(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close desktop popover on table or page scroll so it never detaches or floats away
  useEffect(() => {
    if (!activePicker || activePicker.isBottomSheet) return;
    const handleScroll = () => {
      setActivePicker(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activePicker]);

  const handleCellClick = (e, staffId, dayNumber) => {
    const isSmall = window.innerWidth < 640;
    if (isSmall) {
      setActivePicker({
        staffId,
        dayNumber,
        isBottomSheet: true
      });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const popoverWidth = 240;
      const popoverHeight = 280;

      // Exact horizontal center relative to the clicked cell
      const cellCenter = rect.left + rect.width / 2;
      let left = Math.round(cellCenter - popoverWidth / 2);

      // Clamp within viewport
      left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));

      // Pointer arrow horizontal position (relative to popover left)
      const arrowLeft = Math.max(16, Math.min(Math.round(cellCenter - left), popoverWidth - 16));

      // Vertical position relative to viewport (pure fixed coords without window.scrollY)
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      let placement = 'bottom';

      if (spaceBelow >= popoverHeight + 10) {
        top = Math.round(rect.bottom + 6);
        placement = 'bottom';
      } else if (spaceAbove >= popoverHeight + 10) {
        top = Math.round(rect.top - popoverHeight - 6);
        placement = 'top';
      } else {
        if (spaceBelow >= spaceAbove) {
          top = Math.round(Math.min(rect.bottom + 6, window.innerHeight - popoverHeight - 12));
          placement = 'bottom';
        } else {
          top = Math.round(Math.max(12, rect.top - popoverHeight - 6));
          placement = 'top';
        }
      }

      setActivePicker({
        staffId,
        dayNumber,
        isBottomSheet: false,
        top,
        left,
        placement,
        arrowLeft
      });
    }
  };

  const handleCellDoubleClick = (staffId, dayNumber, currentShift) => {
    let nextShift = 'MT';
    if (currentShift === 'MT') nextShift = 'N';
    else if (currentShift === 'N') nextShift = 'D';
    else nextShift = 'MT';
    onUpdateShift(staffId, dayNumber, nextShift);
  };

  const handleSelectShift = (shiftCode) => {
    if (activePicker) {
      onUpdateShift(activePicker.staffId, activePicker.dayNumber, shiftCode);
      setActivePicker(null);
    }
  };

  // Scroll table horizontally to today
  const scrollToToday = () => {
    if (!tableContainerRef.current) return;
    const targetDay = isCurrentMonth ? realTodayDate : 1;
    const cellWidth = density === 'compact' ? 32 : 38;
    const scrollTarget = Math.max(0, (targetDay - 2) * cellWidth);
    tableContainerRef.current.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  };

  const filterBySearch = (list) => {
    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(q) || (p.documentId && p.documentId.includes(q)));
  };

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const nurses = filterBySearch(activeStaff.filter(s => s.role === ROLES.ENFERMERO));
  const techs = filterBySearch(activeStaff.filter(s => s.role === ROLES.TECNICO));

  // Dynamic sticky column metrics based on viewport
  const nameColWidth = isMobile ? 140 : 280;
  const grdColWidth = isMobile ? 36 : 44;
  const nameLeft = isMobile ? 0 : 84;
  const grdLeft = isMobile ? nameColWidth : 364;

  const renderShiftCellContent = (shiftCode, isModified = false) => {
    const isDayShift = shiftCode === 'MT';
    const isNightShift = shiftCode === 'N';
    const dayLabel = displayStyle === 'D_N' ? 'D' : 'MT';

    if (colorTheme === 'classic') {
      if (isDayShift) {
        return (
          <span className={`font-black text-[13px] leading-none ${isModified ? 'text-red-600 font-black underline decoration-red-400' : 'text-slate-900'}`}>
            {dayLabel}
          </span>
        );
      }
      if (isNightShift) {
        return (
          <span className={`font-black text-[13px] leading-none ${isModified ? 'text-red-600 font-black underline decoration-red-400' : 'text-blue-900'}`}>
            N
          </span>
        );
      }
      if (shiftCode === 'VAC') {
        return <span className="font-bold text-[10px] text-emerald-700">VAC</span>;
      }
      if (shiftCode === 'DM') {
        return <span className="font-bold text-[10px] text-rose-700">DM</span>;
      }
      return <span className="text-transparent select-none text-[10px]">-</span>;
    }

    // Modern color theme (Color Suave)
    if (isDayShift) {
      return (
        <span
          className={`inline-flex items-center justify-center w-full py-0.5 rounded text-[11px] font-extrabold ${
            isModified
              ? 'bg-rose-100 text-rose-900 border border-rose-400 ring-1 ring-rose-400/60 font-black'
              : 'bg-amber-100 text-amber-950 border border-amber-300'
          }`}
        >
          {dayLabel}
        </span>
      );
    }
    if (isNightShift) {
      return (
        <span
          className={`inline-flex items-center justify-center w-full py-0.5 rounded text-[11px] font-extrabold ${
            isModified
              ? 'bg-rose-100 text-rose-900 border border-rose-400 ring-1 ring-rose-400/60 font-black'
              : 'bg-indigo-100 text-indigo-950 border border-indigo-300'
          }`}
        >
          N
        </span>
      );
    }
    if (shiftCode === 'VAC') {
      return <span className="inline-block w-full py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">VAC</span>;
    }
    if (shiftCode === 'DM') {
      return <span className="inline-block w-full py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">DM</span>;
    }
    if (displayStyle === 'D_N') {
      return <span className="text-transparent select-none text-[10px]">-</span>;
    }
    return <span className="inline-block w-full py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100">D</span>;
  };

  // Helper to render staff rows
  const renderStaffRows = (list, roleType, targetCount) => {
    return (
      <>
        {list.map((person, idx) => {
          const personSchedule = schedule?.[person.id] || {};
          let countMT = 0;
          let countN = 0;

          for (let d = 1; d <= daysInMonth; d++) {
            const s = personSchedule[d];
            if (s === 'MT') countMT++;
            else if (s === 'N') countN++;
          }

          const totalGuardias = countMT + countN;
          const totalHoras = totalGuardias * 12;
          const isHoveredRow = hoveredCell?.staffId === person.id;
          const rowBgClass = isHoveredRow ? 'bg-amber-100/70' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70');
          const stickyBgClass = isHoveredRow ? 'bg-amber-100' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50');

          return (
            <tr key={person.id} className={`${rowBgClass} transition-colors border-b border-slate-200`}>
              {/* DNI (Hidden on small mobile screens to grant maximum space to days) */}
              {!isMobile && (
                <td
                  style={{ left: 0, width: 84, minWidth: 84, maxWidth: 84 }}
                  className={`sticky ${stickyBgClass} px-2 py-1 text-center font-mono text-[11px] font-bold text-slate-700 z-10 border-r border-slate-300`}
                >
                  {person.documentId || '—'}
                </td>
              )}

              {/* Name */}
              <td
                style={{ left: nameLeft, width: nameColWidth, minWidth: nameColWidth, maxWidth: nameColWidth }}
                className={`sticky ${stickyBgClass} px-2 sm:px-3 py-1 z-10 border-r border-slate-300 truncate`}
              >
                <div className="font-bold text-slate-900 text-[11px] sm:text-xs truncate" title={person.name}>
                  {person.name}
                </div>
              </td>

              {/* Group */}
              <td
                style={{ left: grdLeft, width: grdColWidth, minWidth: grdColWidth, maxWidth: grdColWidth }}
                className={`sticky ${stickyBgClass} px-0.5 sm:px-1 py-1 text-center z-10 border-r border-slate-300 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)] font-bold text-[10px] text-slate-600`}
              >
                {person.group || 'G1'}
              </td>

              {/* Shift Day Cells */}
              {daysArray.map(d => {
                const shiftCode = personSchedule[d.dayNumber] || 'D';
                const isHoveredCol = hoveredCell?.dayNumber === d.dayNumber;
                const isModified = Number(year) === 2026 && Number(month) === 9 && OFFICIAL_SEPTEMBER_MODIFICATIONS[person.id]?.includes(d.dayNumber);
                const isTodayCol = isCurrentMonth && d.dayNumber === realTodayDate;
                const isActiveCell = activePicker?.staffId === person.id && activePicker?.dayNumber === d.dayNumber;

                return (
                  <td
                    key={d.dayNumber}
                    style={{ width: density === 'compact' ? 32 : 38, minWidth: density === 'compact' ? 32 : 38 }}
                    onClick={(e) => handleCellClick(e, person.id, d.dayNumber)}
                    onDoubleClick={() => handleCellDoubleClick(person.id, d.dayNumber, shiftCode)}
                    onMouseEnter={() => setHoveredCell({ staffId: person.id, dayNumber: d.dayNumber })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`p-0 text-center border-r border-slate-200 cursor-pointer select-none transition-colors ${
                      density === 'compact' ? 'h-7' : 'h-8'
                    } ${
                      isActiveCell
                        ? 'ring-2 ring-[#002060] ring-inset z-20 bg-blue-100 font-black shadow-xs'
                        : isHoveredCol && isHoveredRow
                        ? 'ring-2 ring-blue-600 ring-inset z-5 bg-blue-100'
                        : isHoveredCol
                        ? 'bg-amber-100/60'
                        : isTodayCol
                        ? 'bg-blue-50/70 border-x border-blue-400'
                        : d.isWeekend
                        ? 'bg-slate-100/50'
                        : ''
                    }`}
                    title={`Día ${d.dayNumber} (${d.dayName}): ${shiftCode}${isModified ? ' (Ajuste oficial)' : ''} • Clic para menú`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {renderShiftCellContent(shiftCode, isModified)}
                    </div>
                  </td>
                );
              })}

              {/* Stats */}
              <td style={{ width: 38, minWidth: 38 }} className="px-1 py-1 text-center font-extrabold text-amber-900 bg-amber-50/50 border-l border-slate-300 text-xs">
                {countMT}
              </td>
              <td style={{ width: 38, minWidth: 38 }} className="px-1 py-1 text-center font-extrabold text-blue-900 bg-blue-50/50 border-l border-slate-300 text-xs">
                {countN}
              </td>
              <td style={{ width: 42, minWidth: 42 }} className="px-1 py-1 text-center font-extrabold text-slate-800 bg-slate-100 border-l border-slate-300 text-xs">
                {totalGuardias}
              </td>
              <td style={{ width: 48, minWidth: 48 }} className="px-1 py-1 text-center font-black text-teal-800 bg-teal-50 border-l border-slate-300 text-xs">
                {totalHoras}h
              </td>
            </tr>
          );
        })}

        {/* Section Totals Rows */}
        {/* Total Diurno */}
        <tr className="bg-amber-100 font-bold border-t-2 border-amber-400 text-[11px]">
          <td
            colSpan={isMobile ? 2 : 3}
            style={{ left: 0 }}
            className="sticky bg-amber-100 px-2 sm:px-3 py-1.5 text-amber-950 z-10 border-r border-amber-300 font-extrabold shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center space-x-1.5 truncate">
              <Sun className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">TOTAL {roleType === ROLES.ENFERMERO ? 'ENF.' : 'TÉC.'} DÍA ({displayStyle === 'D_N' ? 'D' : 'MT'}) — Obj: {targetCount}</span>
            </div>
          </td>
          {daysArray.map(d => {
            let count = 0;
            list.forEach(p => {
              if (schedule?.[p.id]?.[d.dayNumber] === 'MT') count++;
            });
            const isOk = count === targetCount;
            const isDeficit = count < targetCount;
            const isHoveredCol = hoveredCell?.dayNumber === d.dayNumber;

            return (
              <td
                key={d.dayNumber}
                onClick={() => {
                  if (isDeficit && onOpenReplacementAssistant) {
                    onOpenReplacementAssistant({
                      dayNumber: d.dayNumber,
                      role: roleType,
                      shift: 'MT',
                      currentCount: count,
                      targetCount
                    });
                  }
                }}
                className={`text-center py-1 border-r border-amber-300 font-extrabold transition-all ${
                  isHoveredCol ? 'bg-amber-300' : ''
                } ${
                  isOk 
                    ? 'text-emerald-900 bg-emerald-100/60' 
                    : isDeficit 
                    ? 'text-rose-950 bg-rose-200 font-black cursor-pointer hover:bg-rose-300 hover:ring-2 hover:ring-rose-500 animate-pulse' 
                    : 'text-amber-950 bg-amber-200'
                }`}
                title={
                  isDeficit 
                    ? `Déficit Diurno Día ${d.dayNumber}: ${count} de ${targetCount}. ¡Clic para abrir Asistente de Reemplazo!` 
                    : `Diurno Día ${d.dayNumber}: ${count} de ${targetCount}`
                }
              >
                <div className="flex items-center justify-center space-x-0.5">
                  <span>{count}</span>
                  {isDeficit && <span className="text-[9px] text-rose-700 leading-none">⚠️</span>}
                </div>
              </td>
            );
          })}
          <td colSpan={4} className="bg-amber-100 text-center text-amber-800 font-normal">
            -
          </td>
        </tr>

        {/* Total Nocturno */}
        <tr className="bg-blue-100 font-bold border-t border-blue-300 text-[11px]">
          <td
            colSpan={isMobile ? 2 : 3}
            style={{ left: 0 }}
            className="sticky bg-blue-100 px-2 sm:px-3 py-1.5 text-blue-950 z-10 border-r border-blue-300 font-extrabold shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center space-x-1.5 truncate">
              <Moon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="truncate">TOTAL {roleType === ROLES.ENFERMERO ? 'ENF.' : 'TÉC.'} NOCHE (N) — Obj: {targetCount}</span>
            </div>
          </td>
          {daysArray.map(d => {
            let count = 0;
            list.forEach(p => {
              if (schedule?.[p.id]?.[d.dayNumber] === 'N') count++;
            });
            const isOk = count === targetCount;
            const isDeficit = count < targetCount;
            const isHoveredCol = hoveredCell?.dayNumber === d.dayNumber;

            return (
              <td
                key={d.dayNumber}
                onClick={() => {
                  if (isDeficit && onOpenReplacementAssistant) {
                    onOpenReplacementAssistant({
                      dayNumber: d.dayNumber,
                      role: roleType,
                      shift: 'N',
                      currentCount: count,
                      targetCount
                    });
                  }
                }}
                className={`text-center py-1 border-r border-blue-300 font-extrabold transition-all ${
                  isHoveredCol ? 'bg-blue-200' : ''
                } ${
                  isOk 
                    ? 'text-emerald-900 bg-emerald-100/60' 
                    : isDeficit 
                    ? 'text-rose-950 bg-rose-200 font-black cursor-pointer hover:bg-rose-300 hover:ring-2 hover:ring-rose-500 animate-pulse' 
                    : 'text-blue-950 bg-blue-200'
                }`}
                title={
                  isDeficit 
                    ? `Déficit Nocturno Día ${d.dayNumber}: ${count} de ${targetCount}. ¡Clic para abrir Asistente de Reemplazo!` 
                    : `Nocturno Día ${d.dayNumber}: ${count} de ${targetCount}`
                }
              >
                <div className="flex items-center justify-center space-x-0.5">
                  <span>{count}</span>
                  {isDeficit && <span className="text-[9px] text-rose-700 leading-none">⚠️</span>}
                </div>
              </td>
            );
          })}
          <td colSpan={4} className="bg-blue-100 text-center text-blue-800 font-normal">
            -
          </td>
        </tr>
      </>
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-300 bg-white">
      {/* Mobile Touch & Scroll Helper Bar */}
      {isMobile && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-blue-950">
          <div className="flex items-center space-x-1 font-medium">
            <span>👉</span>
            <span>Desliza para ver días</span>
          </div>
          <button
            onClick={scrollToToday}
            className="bg-[#002060] hover:bg-[#001848] text-white px-2.5 py-0.5 rounded-md font-bold text-[10px] shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            📍 Ir a Hoy ({isCurrentMonth ? realTodayDate : 1})
          </button>
        </div>
      )}

      {/* ONE SINGLE UNIFIED TABLE FOR FULL HORIZONTAL SYNCHRONIZATION */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="w-full border-collapse text-xs select-none">
          <thead>
            {/* ROW 1: Weekday Initial Letters (M, M, J, V, S, D, L...) */}
            <tr className="bg-[#1e3a8a] text-white border-b border-blue-900 text-[11px]">
              {!isMobile && (
                <th
                  style={{ left: 0, width: 84, minWidth: 84, maxWidth: 84 }}
                  className="sticky bg-[#1e3a8a] px-2 py-1.5 text-center font-bold z-30 border-r border-blue-800"
                >
                  DNI
                </th>
              )}
              <th
                style={{ left: nameLeft, width: nameColWidth, minWidth: nameColWidth, maxWidth: nameColWidth }}
                className="sticky bg-[#1e3a8a] px-2 sm:px-3 py-1.5 text-left font-bold z-30 border-r border-blue-800"
              >
                Colaborador
              </th>
              <th
                style={{ left: grdLeft, width: grdColWidth, minWidth: grdColWidth, maxWidth: grdColWidth }}
                className="sticky bg-[#1e3a8a] px-0.5 sm:px-1 py-1.5 text-center font-bold z-30 border-r border-blue-800 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.25)]"
              >
                G.
              </th>

              {daysArray.map(d => {
                const isHoveredCol = hoveredCell?.dayNumber === d.dayNumber;
                const isTodayCol = isCurrentMonth && d.dayNumber === realTodayDate;

                return (
                  <th
                    key={d.dayNumber}
                    style={{ width: density === 'compact' ? 32 : 38, minWidth: density === 'compact' ? 32 : 38 }}
                    className={`py-1 text-center font-bold border-r border-blue-800 transition-colors ${
                      isHoveredCol
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : isTodayCol
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : d.isWeekend
                        ? 'bg-blue-900 text-amber-300'
                        : 'text-white'
                    }`}
                  >
                    <span className="text-[11px] uppercase">{d.dayName.slice(0, 1)}</span>
                  </th>
                );
              })}

              <th style={{ width: 38, minWidth: 38 }} className="px-1 py-1 text-center font-bold bg-[#172554] text-amber-300 border-l border-blue-800 text-xs">
                {displayStyle === 'D_N' ? 'D' : 'MT'}
              </th>
              <th style={{ width: 38, minWidth: 38 }} className="px-1 py-1 text-center font-bold bg-[#172554] text-blue-200 border-l border-blue-800 text-xs">
                N
              </th>
              <th style={{ width: 42, minWidth: 42 }} className="px-1 py-1 text-center font-bold bg-[#172554] text-slate-200 border-l border-blue-800 text-xs">
                Tot
              </th>
              <th style={{ width: 48, minWidth: 48 }} className="px-1 py-1 text-center font-bold bg-[#0f172a] text-teal-300 border-l border-blue-800 text-xs">
                Horas
              </th>
            </tr>

            {/* ROW 2: Day Numbers (1, 2, 3... 30/31) */}
            <tr className="bg-[#002060] text-white border-b border-blue-900 text-[11px]">
              {!isMobile && (
                <th
                  style={{ left: 0, width: 84 }}
                  className="sticky bg-[#002060] px-2 py-0.5 text-center text-[10px] text-blue-300 z-30 border-r border-blue-800"
                >
                  Documento
                </th>
              )}
              <th
                style={{ left: nameLeft, width: nameColWidth }}
                className="sticky bg-[#002060] px-2 sm:px-3 py-0.5 text-left text-[10px] text-blue-300 z-30 border-r border-blue-800"
              >
                Personal Asignado
              </th>
              <th
                style={{ left: grdLeft, width: grdColWidth }}
                className="sticky bg-[#002060] px-0.5 sm:px-1 py-0.5 text-center text-[10px] text-blue-300 z-30 border-r border-blue-800 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.25)]"
              >
                Grd
              </th>

              {daysArray.map(d => {
                const isHoveredCol = hoveredCell?.dayNumber === d.dayNumber;
                const isTodayCol = isCurrentMonth && d.dayNumber === realTodayDate;

                return (
                  <th
                    key={d.dayNumber}
                    style={{ width: density === 'compact' ? 32 : 38, minWidth: density === 'compact' ? 32 : 38 }}
                    className={`py-0.5 text-center font-extrabold border-r border-blue-800 text-[11px] transition-colors ${
                      isHoveredCol
                        ? 'bg-amber-300 text-slate-950'
                        : isTodayCol
                        ? 'bg-amber-300 text-slate-950 ring-1 ring-amber-400'
                        : d.isWeekend
                        ? 'bg-blue-950 text-amber-300'
                        : 'text-blue-100'
                    }`}
                  >
                    {d.dayNumber}
                  </th>
                );
              })}

              <th colSpan={4} className="bg-[#002060] border-l border-blue-800"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {/* SECTION 1 HEADER: Enfermero(a) - Hospitalizacion Piso 4 */}
            <tr className="bg-[#002060] text-white">
              <td
                colSpan={isMobile ? 2 : 3}
                style={{ left: 0 }}
                className="sticky bg-[#002060] px-2.5 sm:px-3 py-2 text-xs font-black uppercase tracking-wider z-20 border-r border-blue-800 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 shrink-0"></span>
                  <span className="truncate">Enfermero(a) - Hospitalización Piso 4</span>
                </div>
              </td>
              <td colSpan={daysInMonth + 4} className="bg-[#002060] px-3 py-2 text-[11px] text-blue-200">
                ({nurses.length} colaboradores • Cuota: 2 Diurno / 2 Nocturno diarios)
              </td>
            </tr>

            {/* NURSES ROWS */}
            {renderStaffRows(nurses, ROLES.ENFERMERO, 2)}

            {/* DIVIDER: Internas de Enfermería */}
            <tr className="bg-slate-200 text-slate-700 font-bold border-y border-slate-300">
              <td
                colSpan={isMobile ? 2 : 3}
                style={{ left: 0 }}
                className="sticky bg-slate-200 px-2.5 sm:px-3 py-1 text-[11px] uppercase tracking-wider z-10 border-r border-slate-300 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)]"
              >
                Internas de Enfermería
              </td>
              <td colSpan={daysInMonth + 4} className="px-3 py-1 text-[11px] text-slate-500 font-normal">
                Sin rotación obligatoria programada
              </td>
            </tr>

            {/* SECTION 2 HEADER: Tecnico(a) de Enfermeria */}
            <tr className="bg-[#002060] text-white">
              <td
                colSpan={isMobile ? 2 : 3}
                style={{ left: 0 }}
                className="sticky bg-[#002060] px-2.5 sm:px-3 py-2 text-xs font-black uppercase tracking-wider z-20 border-r border-blue-800 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 shrink-0"></span>
                  <span className="truncate">Técnico(a) de Enfermería</span>
                </div>
              </td>
              <td colSpan={daysInMonth + 4} className="bg-[#002060] px-3 py-2 text-[11px] text-blue-200">
                ({techs.length} colaboradores • Cuota: 3 Diurno / 3 Nocturno diarios)
              </td>
            </tr>

            {/* TECHS ROWS */}
            {renderStaffRows(techs, ROLES.TECNICO, 3)}
          </tbody>
        </table>
      </div>

      {/* Shift Popover / Mobile Bottom Sheet */}
      {activePicker && (
        activePicker.isBottomSheet ? (
          /* Mobile Bottom Sheet Modal */
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              ref={popoverRef}
              className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Cambiar Turno • Día {activePicker.dayNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Selecciona el turno para asignar a este colaborador
                  </p>
                </div>
                <button
                  onClick={() => setActivePicker(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={() => handleSelectShift('MT')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 active:bg-amber-100 text-amber-950 font-bold border border-amber-300"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm">
                      {displayStyle === 'D_N' ? 'D' : 'MT'}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-black">Turno Día</div>
                      <div className="text-[11px] text-amber-800">8:00 am - 8:00 pm (12 horas)</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectShift('N')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 active:bg-blue-100 text-blue-950 font-bold border border-blue-300"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                      N
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-black">Turno Noche</div>
                      <div className="text-[11px] text-blue-800">8:00 pm - 8:00 am (12 horas)</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectShift('D')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold border border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-sm">
                      {displayStyle === 'D_N' ? '—' : 'D'}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-bold">Descanso / Libre</div>
                      <div className="text-[11px] text-slate-400">Sin guardia asignada</div>
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleSelectShift('VAC')}
                    className="p-2.5 rounded-xl bg-emerald-50 active:bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 text-center text-xs"
                  >
                    🏖️ Vacaciones
                  </button>
                  <button
                    onClick={() => handleSelectShift('DM')}
                    className="p-2.5 rounded-xl bg-rose-50 active:bg-rose-100 text-rose-950 font-bold border border-rose-300 text-center text-xs"
                  >
                    🏥 Descanso Médico
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Floating Popover */
          <div
            ref={popoverRef}
            style={{ top: activePicker.top, left: activePicker.left }}
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-300 p-2.5 w-60 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Visual Arrow Pointer pointing directly to the clicked cell */}
            <div
              style={{ left: `${activePicker.arrowLeft || 120}px` }}
              className={`absolute w-3 h-3 bg-white border-slate-300 transform rotate-45 -translate-x-1/2 ${
                activePicker.placement === 'top'
                  ? '-bottom-1.5 border-b border-r'
                  : '-top-1.5 border-t border-l'
              }`}
            />

            <div className="relative text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 px-1 pb-1.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-[#002060]">Día {activePicker.dayNumber} • Seleccionar Turno</span>
              <button
                onClick={() => setActivePicker(null)}
                className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleSelectShift('MT')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition-colors border border-amber-200 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-7 py-0.5 bg-amber-500 text-white rounded text-center text-[11px] font-extrabold">
                    {displayStyle === 'D_N' ? 'D' : 'MT'}
                  </span>
                  <span>Turno Día</span>
                </div>
                <span className="text-[10px] text-amber-800 font-bold">8am - 8pm</span>
              </button>

              <button
                onClick={() => handleSelectShift('N')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-bold transition-colors border border-blue-200 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-7 py-0.5 bg-blue-600 text-white rounded text-center text-[11px] font-extrabold">
                    N
                  </span>
                  <span>Turno Noche</span>
                </div>
                <span className="text-[10px] text-blue-800 font-bold">8pm - 8am</span>
              </button>

              <button
                onClick={() => handleSelectShift('D')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-7 py-0.5 bg-slate-300 text-slate-800 rounded text-center text-[11px] font-bold">
                    {displayStyle === 'D_N' ? '—' : 'D'}
                  </span>
                  <span>Descanso</span>
                </div>
                <span className="text-[10px] text-slate-400">Libre</span>
              </button>

              <button
                onClick={() => handleSelectShift('VAC')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-semibold transition-colors border border-emerald-200 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-7 py-0.5 bg-emerald-500 text-white rounded text-center text-[10px] font-bold">
                    VAC
                  </span>
                  <span>Vacaciones</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectShift('DM')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-7 py-0.5 bg-rose-500 text-white rounded text-center text-[10px] font-bold">
                    DM
                  </span>
                  <span>Descanso Médico</span>
                </div>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
