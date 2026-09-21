import ExcelJS from 'exceljs';
import { ROLES, ROLE_LABELS, DEFAULT_CLINIC_INFO } from '../data/initialStaff.js';
import { getDaysInMonth, getMonthDaysArray, calculateStaffStatistics } from './schedulerEngine.js';
import { OFFICIAL_SEPTEMBER_MODIFICATIONS } from '../data/officialSeptSchedule.js';

const MONTH_NAMES_UPPER = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

/**
 * Generates and downloads a visually stunning hospital-grade Excel (.xlsx) workbook
 * styled to match the PDF design: royal blue headers, amber/blue shift badges,
 * crisp borders, frozen panes, subtotals, and official signature blocks.
 */
export async function exportScheduleToExcel(
  staffList,
  schedule,
  year,
  month,
  clinicInfo = DEFAULT_CLINIC_INFO,
  displayStyle = 'MT_N'
) {
  const monthName = MONTH_NAMES_UPPER[month - 1];
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = getMonthDaysArray(year, month);

  const formatShift = (shift) => {
    if (shift === 'MT') return displayStyle === 'D_N' ? 'D' : 'MT';
    if (shift === 'N') return 'N';
    if (shift === 'D') return displayStyle === 'D_N' ? '' : 'D';
    return shift || '';
  };

  const wb = new ExcelJS.Workbook();
  wb.creator = 'MediTurnos Pro • Sistema de Turnos Hospitalarios';
  wb.lastModifiedBy = 'Jefatura de Enfermería';
  wb.created = new Date();
  wb.modified = new Date();

  // Colors Palette
  const C_DARK_BLUE = 'FF002060';   // #002060 (Royal hospital dark blue)
  const C_MID_BLUE = 'FF1E3A8A';    // #1e3a8a (Secondary header blue)
  const C_NAVY = 'FF0F172A';        // #0f172a (Weekend / consolidated footer)
  const C_WHITE = 'FFFFFFFF';
  const C_AMBER_BG = 'FFFEF3C7';    // Day shift background
  const C_AMBER_TXT = 'FF78350F';   // Day shift text
  const C_BLUE_BG = 'FFDBEAFE';     // Night shift background
  const C_BLUE_TXT = 'FF1E3A8A';    // Night shift text
  const C_TEAL_BG = 'FFCCFBF1';     // Hours column
  const C_TEAL_TXT = 'FF0F766E';
  const C_GRAY_BORDER = 'FFCBD5E1'; // Thin cell border
  const C_LIGHT_ROW = 'FFF8FAFC';   // Alternating row background

  const thinBorder = {
    top: { style: 'thin', color: { argb: C_GRAY_BORDER } },
    left: { style: 'thin', color: { argb: C_GRAY_BORDER } },
    bottom: { style: 'thin', color: { argb: C_GRAY_BORDER } },
    right: { style: 'thin', color: { argb: C_GRAY_BORDER } }
  };

  // ==========================================
  // SHEET 1: ROL OFICIAL DE TURNOS (DESIGN MATCHING PDF)
  // ==========================================
  const ws1 = wb.addWorksheet(`Rol_${monthName}`, {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const totalCols = 5 + daysInMonth + 4; // #, DNI, Nombre, Cargo, Grd + Days + Totals(4)
  const lastColLetter = getColLetter(totalCols);

  // --- Row 1: Hospital Main Header ---
  ws1.mergeCells(`A1:${lastColLetter}1`);
  const r1 = ws1.getCell('A1');
  r1.value = `HOSPITAL / CLÍNICA — ${clinicInfo.sede || 'SAN BORJA (TORRE HOSPITALARIA)'}`;
  r1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: C_WHITE } };
  r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_DARK_BLUE } };
  r1.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(1).height = 30;

  // --- Row 2: Subtitle (Área, Mes, Emisión, Código) ---
  ws1.mergeCells(`A2:${lastColLetter}2`);
  const r2 = ws1.getCell('A2');
  r2.value = `DEPARTAMENTO DE ENFERMERÍA • ÁREA: ${clinicInfo.area || 'HOSPITALIZACION 4TO PISO'} • ROL MENSUAL: ${monthName} ${year} • CÓDIGO: ROL-ENF-${year}-${String(month).padStart(2, '0')}`;
  r2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFE2E8F0' } };
  r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_MID_BLUE } };
  r2.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(2).height = 22;

  // --- Row 3: Shift Hours Commentary Banner ---
  ws1.mergeCells(`A3:${lastColLetter}3`);
  const r3 = ws1.getCell('A3');
  r3.value = `HORARIOS OFICIALES: Turno Día = 8:00 am a 8:00 pm (12 hrs) | Turno Noche = 8:00 pm a 8:00 am (12 hrs) | Descanso = 3 días libres consecutivos tras guardia`;
  r3.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  r3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  r3.alignment = { vertical: 'middle', horizontal: 'center' };
  r3.border = thinBorder;
  ws1.getRow(3).height = 20;

  // --- Row 4: Empty space ---
  ws1.getRow(4).height = 8;

  // --- Row 5: Table Header 1 - Weekday initials (M, M, J, V, S, D, L...) ---
  const r5 = ws1.getRow(5);
  r5.height = 22;
  const h1Values = ['N°', 'DNI', 'APELLIDOS Y NOMBRES', 'CARGO / SERVICIO', 'GRD'];
  daysArray.forEach(d => h1Values.push(d.dayName.slice(0, 1).toUpperCase()));
  h1Values.push(displayStyle === 'D_N' ? 'TOTAL D' : 'TOTAL MT', 'TOTAL N', 'GUARDIAS', 'TOTAL HORAS');

  h1Values.forEach((val, idx) => {
    const colIdx = idx + 1;
    const cell = r5.getCell(colIdx);
    cell.value = val;
    const isDayCol = colIdx > 5 && colIdx <= 5 + daysInMonth;
    const dayInfo = isDayCol ? daysArray[colIdx - 6] : null;

    if (dayInfo && dayInfo.isWeekend) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
      cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFDE047' } }; // Gold text for weekend
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_MID_BLUE } };
      cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: C_WHITE } };
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  // --- Row 6: Table Header 2 - Day Numbers (1, 2, 3... 30/31) ---
  const r6 = ws1.getRow(6);
  r6.height = 20;
  const h2Values = ['', '', 'PERSONAL ASIGNADO', '', ''];
  daysArray.forEach(d => h2Values.push(d.dayNumber));
  h2Values.push('8am-8pm', '8pm-8am', 'Turnos', 'Horas (12h)');

  h2Values.forEach((val, idx) => {
    const colIdx = idx + 1;
    const cell = r6.getCell(colIdx);
    cell.value = val;
    const isDayCol = colIdx > 5 && colIdx <= 5 + daysInMonth;
    const dayInfo = isDayCol ? daysArray[colIdx - 6] : null;

    if (dayInfo && dayInfo.isWeekend) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
      cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFDE047' } };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_DARK_BLUE } };
      cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: C_WHITE } };
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const nurses = activeStaff.filter(s => s.role === ROLES.ENFERMERO);
  const techs = activeStaff.filter(s => s.role === ROLES.TECNICO);

  let currentRowIdx = 7;
  let personCounter = 1;

  // Helper to add a stylized section of staff
  const addStyledSection = (list, sectionTitle, roleLabel, quotaTarget) => {
    // Section Header Row
    ws1.mergeCells(`A${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
    const secCell = ws1.getCell(`A${currentRowIdx}`);
    secCell.value = `${sectionTitle} — (CUOTA REQUERIDA: ${quotaTarget} EN TURNO DÍA Y ${quotaTarget} EN TURNO NOCHE DIARIOS)`;
    secCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: C_WHITE } };
    secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_DARK_BLUE } };
    secCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws1.getRow(currentRowIdx).height = 22;
    currentRowIdx++;

    // Staff rows
    list.forEach((person, pIdx) => {
      const row = ws1.getRow(currentRowIdx);
      row.height = 20;
      const isAlt = pIdx % 2 === 1;
      const personSchedule = schedule?.[person.id] || {};
      let countDay = 0;
      let countNight = 0;

      // Col 1: #
      const cNum = row.getCell(1);
      cNum.value = personCounter++;
      cNum.alignment = { vertical: 'middle', horizontal: 'center' };
      cNum.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
      cNum.border = thinBorder;
      cNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C_LIGHT_ROW : C_WHITE } };

      // Col 2: DNI
      const cDni = row.getCell(2);
      cDni.value = person.documentId || '-';
      cDni.alignment = { vertical: 'middle', horizontal: 'center' };
      cDni.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF334155' } };
      cDni.border = thinBorder;
      cDni.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C_LIGHT_ROW : C_WHITE } };

      // Col 3: Nombres
      const cName = row.getCell(3);
      cName.value = person.name;
      cName.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cName.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      cName.border = thinBorder;
      cName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C_LIGHT_ROW : C_WHITE } };

      // Col 4: Cargo
      const cRole = row.getCell(4);
      cRole.value = roleLabel;
      cRole.alignment = { vertical: 'middle', horizontal: 'left' };
      cRole.font = { name: 'Calibri', size: 9, color: { argb: 'FF475569' } };
      cRole.border = thinBorder;
      cRole.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C_LIGHT_ROW : C_WHITE } };

      // Col 5: Guardia
      const cGrd = row.getCell(5);
      cGrd.value = person.group || 'G1';
      cGrd.alignment = { vertical: 'middle', horizontal: 'center' };
      cGrd.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF002060' } };
      cGrd.border = thinBorder;
      cGrd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C_LIGHT_ROW : C_WHITE } };

      // Day Shift Cells (Columns 6 to 5 + daysInMonth)
      for (let day = 1; day <= daysInMonth; day++) {
        const colIdx = 5 + day;
        const cell = row.getCell(colIdx);
        const shiftCode = personSchedule[day] || 'D';
        const isDay = shiftCode === 'MT';
        const isNight = shiftCode === 'N';
        const label = formatShift(shiftCode);

        cell.value = label;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = thinBorder;

        const isMod = Number(year) === 2026 && Number(month) === 9 && OFFICIAL_SEPTEMBER_MODIFICATIONS[person.id]?.includes(day);

        if (isDay) {
          countDay++;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isMod ? 'FFFFE4E6' : C_AMBER_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: isMod ? 'FFDC2626' : C_AMBER_TXT } };
        } else if (isNight) {
          countNight++;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isMod ? 'FFFFE4E6' : C_BLUE_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: isMod ? 'FFDC2626' : C_BLUE_TXT } };
        } else if (shiftCode === 'VAC') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF065F46' } };
        } else if (shiftCode === 'DM') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF9F1239' } };
        } else {
          // Rest (blank)
          const isWeekend = daysArray[day - 1]?.isWeekend;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekend ? 'FFF1F5F9' : (isAlt ? C_LIGHT_ROW : C_WHITE) } };
          cell.font = { name: 'Calibri', size: 9, color: { argb: 'FF94A3B8' } };
        }
      }

      // Totals Columns
      const totalGuards = countDay + countNight;
      const totalHours = totalGuards * 12;

      const cTotDay = row.getCell(6 + daysInMonth);
      cTotDay.value = countDay;
      cTotDay.alignment = { vertical: 'middle', horizontal: 'center' };
      cTotDay.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: C_AMBER_TXT } };
      cTotDay.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_AMBER_BG } };
      cTotDay.border = thinBorder;

      const cTotNight = row.getCell(7 + daysInMonth);
      cTotNight.value = countNight;
      cTotNight.alignment = { vertical: 'middle', horizontal: 'center' };
      cTotNight.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: C_BLUE_TXT } };
      cTotNight.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_BLUE_BG } };
      cTotNight.border = thinBorder;

      const cTotGrd = row.getCell(8 + daysInMonth);
      cTotGrd.value = totalGuards;
      cTotGrd.alignment = { vertical: 'middle', horizontal: 'center' };
      cTotGrd.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
      cTotGrd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      cTotGrd.border = thinBorder;

      const cTotHrs = row.getCell(9 + daysInMonth);
      cTotHrs.value = `${totalHours} hrs`;
      cTotHrs.alignment = { vertical: 'middle', horizontal: 'center' };
      cTotHrs.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: C_TEAL_TXT } };
      cTotHrs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TEAL_BG } };
      cTotHrs.border = thinBorder;

      currentRowIdx++;
    });

    // Subtotal Row: Diurno (8am - 8pm)
    ws1.mergeCells(`A${currentRowIdx}:E${currentRowIdx}`);
    const subDayLabel = ws1.getCell(`A${currentRowIdx}`);
    subDayLabel.value = `SUBTOTAL ${roleLabel.toUpperCase()} DIURNO (8:00 AM - 8:00 PM) — OBJ: ${quotaTarget}`;
    subDayLabel.font = { name: 'Calibri', size: 9, bold: true, color: { argb: C_AMBER_TXT } };
    subDayLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    subDayLabel.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
    ws1.getRow(currentRowIdx).height = 20;

    for (let day = 1; day <= daysInMonth; day++) {
      let c = 0;
      list.forEach(p => {
        if (schedule?.[p.id]?.[day] === 'MT') c++;
      });
      const cell = ws1.getRow(currentRowIdx).getCell(5 + day);
      cell.value = c;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: c === quotaTarget ? 'FF065F46' : 'FF991B1B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c === quotaTarget ? 'FFD1FAE5' : 'FFFEE2E2' } };
      cell.border = thinBorder;
    }
    for (let i = 1; i <= 4; i++) {
      const cell = ws1.getRow(currentRowIdx).getCell(5 + daysInMonth + i);
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    }
    currentRowIdx++;

    // Subtotal Row: Nocturno (8pm - 8am)
    ws1.mergeCells(`A${currentRowIdx}:E${currentRowIdx}`);
    const subNightLabel = ws1.getCell(`A${currentRowIdx}`);
    subNightLabel.value = `SUBTOTAL ${roleLabel.toUpperCase()} NOCTURNO (8:00 PM - 8:00 AM) — OBJ: ${quotaTarget}`;
    subNightLabel.font = { name: 'Calibri', size: 9, bold: true, color: { argb: C_BLUE_TXT } };
    subNightLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    subNightLabel.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
    ws1.getRow(currentRowIdx).height = 20;

    for (let day = 1; day <= daysInMonth; day++) {
      let c = 0;
      list.forEach(p => {
        if (schedule?.[p.id]?.[day] === 'N') c++;
      });
      const cell = ws1.getRow(currentRowIdx).getCell(5 + day);
      cell.value = c;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: c === quotaTarget ? 'FF065F46' : 'FF991B1B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c === quotaTarget ? 'FFD1FAE5' : 'FFFEE2E2' } };
      cell.border = thinBorder;
    }
    for (let i = 1; i <= 4; i++) {
      const cell = ws1.getRow(currentRowIdx).getCell(5 + daysInMonth + i);
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    }
    currentRowIdx++;
  };

  // 1. Nurses Section
  addStyledSection(nurses, 'I. PROFESIONALES EN ENFERMERÍA (LICENCIADOS)', 'Lic. Enfermería', 2);

  // 2. Interns Divider
  ws1.mergeCells(`A${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
  const internCell = ws1.getCell(`A${currentRowIdx}`);
  internCell.value = 'II. INTERNAS DE ENFERMERÍA — (SIN ROL ASIGNADO OBLIGATORIO)';
  internCell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF475569' } };
  internCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  internCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws1.getRow(currentRowIdx).height = 20;
  currentRowIdx++;

  // 3. Technicians Section
  addStyledSection(techs, 'III. TÉCNICOS EN ENFERMERÍA', 'Téc. Enfermería', 3);

  // 4. Consolidated Daily Totals Row (24 Hours)
  ws1.mergeCells(`A${currentRowIdx}:E${currentRowIdx}`);
  const grandTotCell = ws1.getCell(`A${currentRowIdx}`);
  grandTotCell.value = 'TOTAL PERSONAL ACTIVO EN SERVICIO 24H (OBJETIVO: 10 = 4 ENF + 6 TEC):';
  grandTotCell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: C_WHITE } };
  grandTotCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
  grandTotCell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
  ws1.getRow(currentRowIdx).height = 24;

  for (let day = 1; day <= daysInMonth; day++) {
    let dayTotal = 0;
    activeStaff.forEach(p => {
      const s = schedule?.[p.id]?.[day];
      if (s === 'MT' || s === 'N') dayTotal++;
    });
    const cell = ws1.getRow(currentRowIdx).getCell(5 + day);
    cell.value = dayTotal;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: dayTotal === 10 ? 'FF34D399' : 'FFF87171' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
    cell.border = thinBorder;
  }
  for (let i = 1; i <= 4; i++) {
    const cell = ws1.getRow(currentRowIdx).getCell(5 + daysInMonth + i);
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
    cell.font = { name: 'Calibri', size: 9, color: { argb: 'FF94A3B8' } };
    cell.value = i === 4 ? '100%' : '';
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }
  currentRowIdx++;

  // 5. Official Signature Blocks (At the bottom)
  currentRowIdx += 2;
  const sigRow1Idx = currentRowIdx;
  const sigRow2Idx = currentRowIdx + 1;
  const sigRow3Idx = currentRowIdx + 2;

  // Signature 1: Coordinación (Cols B to D)
  ws1.mergeCells(`B${sigRow1Idx}:D${sigRow1Idx}`);
  ws1.mergeCells(`B${sigRow2Idx}:D${sigRow2Idx}`);
  ws1.mergeCells(`B${sigRow3Idx}:D${sigRow3Idx}`);
  ws1.getCell(`B${sigRow1Idx}`).value = '__________________________________________';
  ws1.getCell(`B${sigRow2Idx}`).value = 'Lic. Coordinador(a) de Turnos';
  ws1.getCell(`B${sigRow3Idx}`).value = 'Elaboración y Planificación • Sello y Firma';

  // Signature 2: Jefatura (Mid cols)
  const midStart = Math.floor(daysInMonth / 2);
  const midEnd = midStart + 5;
  const s2StartLetter = getColLetter(midStart);
  const s2EndLetter = getColLetter(midEnd);
  ws1.mergeCells(`${s2StartLetter}${sigRow1Idx}:${s2EndLetter}${sigRow1Idx}`);
  ws1.mergeCells(`${s2StartLetter}${sigRow2Idx}:${s2EndLetter}${sigRow2Idx}`);
  ws1.mergeCells(`${s2StartLetter}${sigRow3Idx}:${s2EndLetter}${sigRow3Idx}`);
  ws1.getCell(`${s2StartLetter}${sigRow1Idx}`).value = '__________________________________________';
  ws1.getCell(`${s2StartLetter}${sigRow2Idx}`).value = 'Lic. Jefatura de Enfermería';
  ws1.getCell(`${s2StartLetter}${sigRow3Idx}`).value = 'Revisión y Conformidad • V° B°';

  // Signature 3: Dirección Médica (Right cols)
  const s3StartLetter = getColLetter(totalCols - 5);
  const s3EndLetter = getColLetter(totalCols - 1);
  ws1.mergeCells(`${s3StartLetter}${sigRow1Idx}:${s3EndLetter}${sigRow1Idx}`);
  ws1.mergeCells(`${s3StartLetter}${sigRow2Idx}:${s3EndLetter}${sigRow2Idx}`);
  ws1.mergeCells(`${s3StartLetter}${sigRow3Idx}:${s3EndLetter}${sigRow3Idx}`);
  ws1.getCell(`${s3StartLetter}${sigRow1Idx}`).value = '__________________________________________';
  ws1.getCell(`${s3StartLetter}${sigRow2Idx}`).value = 'Dirección Médica / General';
  ws1.getCell(`${s3StartLetter}${sigRow3Idx}`).value = 'Aprobación Institucional • Sello y Firma';

  [sigRow1Idx, sigRow2Idx, sigRow3Idx].forEach(rIdx => {
    ws1.getRow(rIdx).alignment = { vertical: 'middle', horizontal: 'center' };
  });
  ws1.getRow(sigRow2Idx).font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
  ws1.getRow(sigRow3Idx).font = { name: 'Calibri', size: 8.5, color: { argb: 'FF64748B' } };

  // Set Column Widths for Sheet 1
  ws1.getColumn(1).width = 6;   // N°
  ws1.getColumn(2).width = 13;  // DNI
  ws1.getColumn(3).width = 38;  // Nombres
  ws1.getColumn(4).width = 20;  // Cargo
  ws1.getColumn(5).width = 8;   // Guardia
  for (let d = 1; d <= daysInMonth; d++) {
    ws1.getColumn(5 + d).width = 4.8; // Day columns
  }
  ws1.getColumn(6 + daysInMonth).width = 11; // Tot Day
  ws1.getColumn(7 + daysInMonth).width = 11; // Tot Night
  ws1.getColumn(8 + daysInMonth).width = 11; // Tot Guardias
  ws1.getColumn(9 + daysInMonth).width = 14; // Tot Hours

  // Freeze Panes (Top 6 rows and Left 3 columns stay fixed when scrolling!)
  ws1.views = [
    { state: 'frozen', xSplit: 3, ySplit: 6, topLeftCell: 'D7', activeCell: 'D7' }
  ];


  // ==========================================
  // SHEET 2: AUDITORÍA Y CARGA LABORAL
  // ==========================================
  const ws2 = wb.addWorksheet('Auditoria_Carga_Laboral', {
    pageSetup: { orientation: 'landscape', fitToWidth: 1 }
  });

  ws2.mergeCells('A1:J1');
  const a1 = ws2.getCell('A1');
  a1.value = `REPORTE DE AUDITORÍA Y EQUIDAD DE CARGA LABORAL — ${monthName} ${year}`;
  a1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: C_WHITE } };
  a1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_DARK_BLUE } };
  a1.alignment = { vertical: 'middle', horizontal: 'center' };
  ws2.getRow(1).height = 28;

  ws2.mergeCells('A2:J2');
  const a2 = ws2.getCell('A2');
  a2.value = `Sede: ${clinicInfo.sede} • Servicio: ${clinicInfo.area} • Horarios: 8am-8pm y 8pm-8am (12 horas por guardia)`;
  a2.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFE2E8F0' } };
  a2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_MID_BLUE } };
  a2.alignment = { vertical: 'middle', horizontal: 'center' };
  ws2.getRow(2).height = 20;

  const stats = calculateStaffStatistics(staffList, schedule, year, month);

  // Header row
  const rAuditH = ws2.getRow(4);
  rAuditH.height = 24;
  const auditHeaders = [
    'N°', 'DNI', 'COLABORADOR / PERSONAL', 'CARGO / SERVICIO', 'GUARDIA',
    'TURNOS DÍA (8am-8pm)', 'TURNOS NOCHE (8pm-8am)', 'DÍAS DESCANSO', 'TOTAL GUARDIAS', 'TOTAL HORAS (12H)'
  ];
  auditHeaders.forEach((h, idx) => {
    const c = rAuditH.getCell(idx + 1);
    c.value = h;
    c.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: C_WHITE } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_DARK_BLUE } };
    c.alignment = { vertical: 'middle', horizontal: idx === 2 ? 'left' : 'center', indent: idx === 2 ? 1 : 0 };
    c.border = thinBorder;
  });

  let auditRowIdx = 5;
  let sumGuards = 0;
  let sumHours = 0;

  activeStaff.forEach((person, pIdx) => {
    const s = stats[person.id] || { countMT: 0, countN: 0, countD: 0, totalGuardias: 0, totalHoras: 0 };
    sumGuards += s.totalGuardias;
    sumHours += s.totalHoras;
    const isAlt = pIdx % 2 === 1;

    const row = ws2.getRow(auditRowIdx);
    row.height = 20;

    const cellsData = [
      { val: pIdx + 1, align: 'center', bold: false, color: 'FF64748B' },
      { val: person.documentId || '-', align: 'center', bold: true, color: 'FF334155' },
      { val: person.name, align: 'left', bold: true, color: 'FF0F172A' },
      { val: ROLE_LABELS[person.role] || person.role, align: 'left', bold: false, color: 'FF475569' },
      { val: person.group || 'G1', align: 'center', bold: true, color: 'FF002060' },
      { val: s.countMT, align: 'center', bold: true, color: C_AMBER_TXT, bg: C_AMBER_BG },
      { val: s.countN, align: 'center', bold: true, color: C_BLUE_TXT, bg: C_BLUE_BG },
      { val: s.countD, align: 'center', bold: false, color: 'FF475569' },
      { val: s.totalGuardias, align: 'center', bold: true, color: 'FF1E293B', bg: 'FFF1F5F9' },
      { val: `${s.totalHoras} hrs`, align: 'center', bold: true, color: C_TEAL_TXT, bg: C_TEAL_BG }
    ];

    cellsData.forEach((cd, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = cd.val;
      cell.alignment = { vertical: 'middle', horizontal: cd.align, indent: cd.align === 'left' ? 1 : 0 };
      cell.font = { name: 'Calibri', size: 9.5, bold: cd.bold, color: { argb: cd.color } };
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cd.bg || (isAlt ? C_LIGHT_ROW : C_WHITE) } };
    });

    auditRowIdx++;
  });

  // Totals & Averages row
  const avgHours = activeStaff.length > 0 ? Math.round(sumHours / activeStaff.length) : 0;
  const avgGuards = activeStaff.length > 0 ? (sumGuards / activeStaff.length).toFixed(1) : 0;

  ws2.mergeCells(`A${auditRowIdx}:H${auditRowIdx}`);
  const rAvg = ws2.getRow(auditRowIdx);
  rAvg.height = 24;
  const avgLabel = rAvg.getCell(1);
  avgLabel.value = 'PROMEDIOS GENERALES POR COLABORADOR EN EL SERVICIO:';
  avgLabel.font = { name: 'Calibri', size: 10, bold: true, color: { argb: C_WHITE } };
  avgLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
  avgLabel.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };

  const cAvgGrd = rAvg.getCell(9);
  cAvgGrd.value = `${avgGuards} guardias`;
  cAvgGrd.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFDE047' } };
  cAvgGrd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
  cAvgGrd.alignment = { vertical: 'middle', horizontal: 'center' };
  cAvgGrd.border = thinBorder;

  const cAvgHrs = rAvg.getCell(10);
  cAvgHrs.value = `${avgHours} hrs`;
  cAvgHrs.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF34D399' } };
  cAvgHrs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_NAVY } };
  cAvgHrs.alignment = { vertical: 'middle', horizontal: 'center' };
  cAvgHrs.border = thinBorder;

  ws2.getColumn(1).width = 6;
  ws2.getColumn(2).width = 13;
  ws2.getColumn(3).width = 38;
  ws2.getColumn(4).width = 32;
  ws2.getColumn(5).width = 9;
  ws2.getColumn(6).width = 20;
  ws2.getColumn(7).width = 22;
  ws2.getColumn(8).width = 15;
  ws2.getColumn(9).width = 16;
  ws2.getColumn(10).width = 18;

  ws2.views = [
    { state: 'frozen', xSplit: 0, ySplit: 4, topLeftCell: 'A5', activeCell: 'A5' }
  ];

  // Write and download buffer in browser
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanSede = (clinicInfo.sede || 'Clinica').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15);
  a.download = `Rol_Oficial_Turnos_${cleanSede}_${monthName}_${year}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper to convert column number (1-based) to Excel letter (A, B, ..., Z, AA, AB...)
function getColLetter(colNum) {
  let temp, letter = '';
  while (colNum > 0) {
    temp = (colNum - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colNum = (colNum - temp - 1) / 26;
  }
  return letter;
}
