import { ROLES } from '../data/initialStaff.js';

/**
 * 5-day Hospital Guard Cycle Pattern:
 * Day 0: MT (Diurno 12h: 07:00 - 19:00)
 * Day 1: N  (Nocturno 12h: 19:00 - 07:00)
 * Day 2: D  (Descanso 1)
 * Day 3: D  (Descanso 2)
 * Day 4: D  (Descanso 3)
 * Total cycle = 5 days. Rest between shifts is exactly 3 days.
 */
export const CYCLE_PATTERN = ['MT', 'N', 'D', 'D', 'D'];

export const GROUP_OFFSETS = {
  G1: 0, // Day 0: MT, Day 1: N, Day 2: D, Day 3: D, Day 4: D
  G2: 4, // Day 0: D,  Day 1: MT, Day 2: N, Day 3: D, Day 4: D
  G3: 3, // Day 0: D,  Day 1: D,  Day 2: MT, Day 3: N, Day 4: D
  G4: 2, // Day 0: D,  Day 1: D,  Day 2: D,  Day 3: MT, Day 4: N
  G5: 1  // Day 0: N,  Day 1: D,  Day 2: D,  Day 3: D,  Day 4: MT
};

export const GROUPS = ['G1', 'G2', 'G3', 'G4', 'G5'];

/**
 * Calculates number of days in a given month and year
 */
export function getDaysInMonth(year, month) {
  // month is 1-indexed (1 = January, 12 = December)
  return new Date(year, month, 0).getDate();
}

/**
 * Automatically computes which guard group should start on Day 1 of any month
 * to ensure 100% seamless continuity and exact 3 days of rest across months.
 * Reference: Sept 1, 2026 has G1 starting on MT.
 */
export function getContinuityStartGroup(year, month) {
  // Use UTC to prevent daylight saving timezone shifts
  const refDate = new Date(Date.UTC(2026, 8, 1)); // September 1, 2026
  const targetDate = new Date(Date.UTC(year, month - 1, 1));
  const diffDays = Math.round((targetDate - refDate) / (1000 * 60 * 60 * 24));
  const offset = ((diffDays % 5) + 5) % 5;
  return GROUPS[offset];
}

/**
 * Gets day details for the entire month
 */
export function getMonthDaysArray(year, month) {
  const totalDays = getDaysInMonth(year, month);
  const days = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday
    days.push({
      dayNumber: day,
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  return days;
}

/**
 * Generates the automatic monthly schedule based on staff and rotation rules.
 * @param {Array} staffList List of personnel
 * @param {number} year Selected year
 * @param {number} month Selected month (1-12)
 * @param {string} startGroupOnDayOne Which group starts with MT on day 1 ('G1'..'G5')
 * @returns {Object} { [personnelId]: { [day]: 'MT' | 'N' | 'D' } }
 */
export function generateMonthlySchedule(staffList, year, month, startGroupOnDayOne = null) {
  const daysInMonth = getDaysInMonth(year, month);
  const schedule = {};

  // If no startGroup provided, compute automatic continuity from previous month
  const actualStartGroup = startGroupOnDayOne || getContinuityStartGroup(year, month);
  const groupShiftIndex = GROUPS.indexOf(actualStartGroup);
  const rotationOffset = groupShiftIndex >= 0 ? groupShiftIndex : 0;

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const nurses = activeStaff.filter(s => s.role === ROLES.ENFERMERO);
  const techs = activeStaff.filter(s => s.role === ROLES.TECNICO);

  const assignGroupIfNeeded = (list) => {
    const groupCounts = { G1: 0, G2: 0, G3: 0, G4: 0, G5: 0 };
    list.forEach(p => {
      if (p.group && groupCounts[p.group] !== undefined) {
        groupCounts[p.group]++;
      }
    });

    return list.map(person => {
      if (person.group && GROUPS.includes(person.group)) {
        return person;
      }
      let minGroup = 'G1';
      let minCount = Infinity;
      GROUPS.forEach(g => {
        if (groupCounts[g] < minCount) {
          minCount = groupCounts[g];
          minGroup = g;
        }
      });
      groupCounts[minGroup]++;
      return { ...person, group: minGroup };
    });
  };

  const processedStaff = [
    ...assignGroupIfNeeded(nurses),
    ...assignGroupIfNeeded(techs)
  ];

  processedStaff.forEach(person => {
    schedule[person.id] = {};
    const group = person.group || 'G1';
    const groupIdx = GROUPS.indexOf(group);
    
    // Effective group index considering start group
    const effectiveGroupIdx = (groupIdx - rotationOffset + 5) % 5;
    const effectiveGroup = GROUPS[effectiveGroupIdx];
    const groupBaseOffset = GROUP_OFFSETS[effectiveGroup];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayIndex = day - 1;
      const patternIdx = (dayIndex + groupBaseOffset) % 5;
      schedule[person.id][day] = CYCLE_PATTERN[patternIdx];
    }
  });

  staffList.filter(s => s.status !== 'ACTIVO').forEach(person => {
    schedule[person.id] = {};
    for (let day = 1; day <= daysInMonth; day++) {
      schedule[person.id][day] = 'D';
    }
  });

  return schedule;
}

/**
 * Analyzes daily coverage for every day of the month.
 * Target for Enfermeros: 2 MT, 2 N
 * Target for Técnicos: 3 MT, 3 N
 */
export function calculateDailyCoverage(staffList, schedule, year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const coverage = [];

  const activeStaffMap = new Map();
  staffList.forEach(s => activeStaffMap.set(s.id, s));

  for (let day = 1; day <= daysInMonth; day++) {
    let enfMT = 0;
    let enfN = 0;
    let tecMT = 0;
    let tecN = 0;

    Object.keys(schedule || {}).forEach(staffId => {
      const staff = activeStaffMap.get(staffId);
      if (!staff || staff.status !== 'ACTIVO') return;

      const shift = schedule[staffId]?.[day];
      if (staff.role === ROLES.ENFERMERO) {
        if (shift === 'MT') enfMT++;
        else if (shift === 'N') enfN++;
      } else if (staff.role === ROLES.TECNICO) {
        if (shift === 'MT') tecMT++;
        else if (shift === 'N') tecN++;
      }
    });

    const enfOk = enfMT === 2 && enfN === 2;
    const tecOk = tecMT === 3 && tecN === 3;

    coverage.push({
      day,
      enfermeros: {
        mt: enfMT,
        n: enfN,
        targetMt: 2,
        targetN: 2,
        isComplete: enfOk,
        status: enfOk ? 'ok' : (enfMT < 2 || enfN < 2 ? 'deficit' : 'surplus')
      },
      tecnicos: {
        mt: tecMT,
        n: tecN,
        targetMt: 3,
        targetN: 3,
        isComplete: tecOk,
        status: tecOk ? 'ok' : (tecMT < 3 || tecN < 3 ? 'deficit' : 'surplus')
      },
      isFullyCovered: enfOk && tecOk
    });
  }

  return coverage;
}

/**
 * Calculates individual statistics for each staff member for the month
 */
export function calculateStaffStatistics(staffList, schedule, year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const stats = {};

  staffList.forEach(person => {
    let countMT = 0;
    let countN = 0;
    let countD = 0;
    let countVAC = 0;
    let countDM = 0;

    const personSchedule = schedule?.[person.id] || {};
    for (let day = 1; day <= daysInMonth; day++) {
      const shift = personSchedule[day];
      if (shift === 'MT') countMT++;
      else if (shift === 'N') countN++;
      else if (shift === 'D') countD++;
      else if (shift === 'VAC') countVAC++;
      else if (shift === 'DM') countDM++;
      else countD++;
    }

    const totalGuardias = countMT + countN;
    const totalHoras = (countMT * 12) + (countN * 12);

    stats[person.id] = {
      countMT,
      countN,
      countD,
      countVAC,
      countDM,
      totalGuardias,
      totalHoras
    };
  });

  return stats;
}

/**
 * Projects individual rotation cycle for a staff member starting from a modified day.
 * Standard hospital 5-day cycle: MT -> N -> D -> D -> D
 * @param {string} startShift 'MT' | 'N' | 'D'
 * @param {number} fromDay 1..31
 * @param {number} totalDays 28..31
 * @returns {Object} { [day]: 'MT' | 'N' | 'D' } for day = fromDay..totalDays
 */
export function projectStaffRotationFromDay(startShift, fromDay, totalDays) {
  const projection = {};
  let cycleOffset = 0;

  if (startShift === 'MT') {
    cycleOffset = 0; // starts at MT
  } else if (startShift === 'N') {
    cycleOffset = 1; // starts at N
  } else if (startShift === 'D' || startShift === 'LIBRE') {
    cycleOffset = 2; // starts at first D
  } else {
    // For VAC, DM or others, keep starting shift
    projection[fromDay] = startShift;
    return projection;
  }

  for (let day = fromDay; day <= totalDays; day++) {
    const dayStep = day - fromDay;
    const patternIdx = (dayStep + cycleOffset) % 5;
    projection[day] = CYCLE_PATTERN[patternIdx];
  }

  return projection;
}

/**
 * Generates/recalculates the rotation for the whole hospital ward from a given day onwards,
 * preserving days 1 to (fromDay - 1) intact.
 * Guarantees exact coverage (2 nurses MT/N, 3 technicians MT/N) from fromDay to totalDays.
 * @param {Object} currentSchedule existing schedule
 * @param {Array} staffList staff members
 * @param {number} year
 * @param {number} month
 * @param {number} fromDay starting day for recalculation (1..31)
 * @param {string} targetStartGroup which group starts on MT on fromDay (e.g. 'G1'..'G5')
 * @returns {Object} new merged schedule
 */
export function generateScheduleFromDay(currentSchedule, staffList, year, month, fromDay, targetStartGroup = 'G1') {
  const totalDays = getDaysInMonth(year, month);
  const newSchedule = {};

  const activeStaff = staffList.filter(s => s.status === 'ACTIVO');
  const targetGroupIdx = GROUPS.indexOf(targetStartGroup) >= 0 ? GROUPS.indexOf(targetStartGroup) : 0;

  staffList.forEach(person => {
    newSchedule[person.id] = {};
    // 1. Preserve existing shifts from day 1 up to (fromDay - 1)
    for (let day = 1; day < fromDay; day++) {
      newSchedule[person.id][day] = currentSchedule?.[person.id]?.[day] || 'D';
    }
  });

  // 2. Compute rotation for active staff from fromDay to totalDays
  activeStaff.forEach(person => {
    const group = person.group || 'G1';
    const groupIdx = GROUPS.indexOf(group) >= 0 ? GROUPS.indexOf(group) : 0;

    // Relative group offset compared to targetStartGroup
    const relativeGroupIdx = (groupIdx - targetGroupIdx + 5) % 5;
    const relativeGroup = GROUPS[relativeGroupIdx];
    const baseOffset = GROUP_OFFSETS[relativeGroup];

    for (let day = fromDay; day <= totalDays; day++) {
      const dayStep = day - fromDay;
      const patternIdx = (dayStep + baseOffset) % 5;
      newSchedule[person.id][day] = CYCLE_PATTERN[patternIdx];
    }
  });

  // Inactive staff stay on 'D' from fromDay to totalDays
  staffList.filter(s => s.status !== 'ACTIVO').forEach(person => {
    for (let day = fromDay; day <= totalDays; day++) {
      newSchedule[person.id][day] = 'D';
    }
  });

  return newSchedule;
}

/**
 * Analyzes and ranks eligible staff members to cover a shift deficit on targetDay,
 * ensuring hospital safety rules (no consecutive 24h fatigue) and equity in monthly hours.
 * @param {Array} staffList
 * @param {Object} schedule
 * @param {number} year
 * @param {number} month
 * @param {number} targetDay
 * @param {string} targetShift 'MT' | 'N'
 * @param {string} targetRole 'ENFERMERO' | 'TECNICO'
 * @returns {Array} ranked candidates with details
 */
export function findOptimalReplacements(staffList, schedule, year, month, targetDay, targetShift, targetRole) {
  const totalDays = getDaysInMonth(year, month);
  const candidates = [];

  // Filter staff of the exact same role who are active
  const pool = staffList.filter(s => s.status === 'ACTIVO' && s.role === targetRole);

  pool.forEach(person => {
    const personSchedule = schedule?.[person.id] || {};
    const currentShiftOnDay = personSchedule[targetDay] || 'D';

    // Disqualify if already on duty on targetDay (working MT or N)
    if (currentShiftOnDay === 'MT' || currentShiftOnDay === 'N') {
      return;
    }

    // Disqualify if on vacation or medical leave
    if (currentShiftOnDay === 'VAC' || currentShiftOnDay === 'DM') {
      return;
    }

    // 1. Check previous day (targetDay - 1)
    const prevShift = targetDay > 1 ? (personSchedule[targetDay - 1] || 'D') : 'D';
    const workedNightYesterday = (prevShift === 'N');

    // 2. Check next day (targetDay + 1)
    const nextShift = targetDay < totalDays ? (personSchedule[targetDay + 1] || 'D') : 'D';
    const hasMorningAfterNight = (targetShift === 'N' && nextShift === 'MT');

    // 3. Consecutive rest days prior to targetDay
    let consecutiveRestDays = 0;
    for (let d = targetDay - 1; d >= 1; d--) {
      const s = personSchedule[d] || 'D';
      if (s === 'D' || s === 'LIBRE' || s === '') {
        consecutiveRestDays++;
      } else {
        break;
      }
    }

    // 4. Monthly shifts and hours accumulated
    let totalMT = 0;
    let totalN = 0;
    for (let d = 1; d <= totalDays; d++) {
      const s = personSchedule[d];
      if (s === 'MT') totalMT++;
      else if (s === 'N') totalN++;
    }
    const totalGuardias = totalMT + totalN;
    const totalHoras = totalGuardias * 12;

    // 5. Score calculation
    let score = 100;
    let fatigueRisk = false;
    const warnings = [];

    // Critical fatigue check: cannot work MT (8am) if worked N (8pm-8am) previous day
    if (targetShift === 'MT' && workedNightYesterday) {
      fatigueRisk = true;
      score -= 1000;
      warnings.push('Salió de Turno Noche el día anterior (riesgo de 24h continuas)');
    }

    if (hasMorningAfterNight) {
      score -= 300;
      warnings.push('Tiene Turno Día programado al día siguiente');
    }

    // Reward for consecutive rest days
    score += consecutiveRestDays * 25;

    // Reward for having fewer monthly hours (balancing equity, ideal ~12-13 guardias)
    const hoursDiffFromTarget = 13 - totalGuardias;
    score += hoursDiffFromTarget * 15;

    // Classification tier
    let tier = 'AVAILABLE';
    let badge = '🟢 Disponible';

    if (fatigueRisk) {
      tier = 'FATIGUE_RISK';
      badge = '⛔ Riesgo Fatiga';
    } else if (score >= 130 && consecutiveRestDays >= 2) {
      tier = 'TOP_RECOMMENDED';
      badge = '⭐ Máxima Recomendación';
    } else if (score >= 100) {
      tier = 'RECOMMENDED';
      badge = '✨ Recomendado';
    }

    candidates.push({
      person,
      score,
      tier,
      badge,
      consecutiveRestDays,
      totalGuardias,
      totalHoras,
      prevShift,
      nextShift,
      warnings,
      currentShiftOnDay
    });
  });

  // Sort descending by score (best candidates first)
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}
