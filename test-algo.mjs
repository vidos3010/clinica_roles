import { INITIAL_STAFF, ROLES } from './src/data/initialStaff.js';
import { generateMonthlySchedule, calculateDailyCoverage, calculateStaffStatistics, getDaysInMonth } from './src/services/schedulerEngine.js';

console.log("=== PRUEBA EXACTA: SETIEMBRE 2026 (SAN BORJA - HOSPITALIZACION 4TO PISO) ===");

const year = 2026;
const month = 9; // Setiembre (30 días)
const daysInMonth = getDaysInMonth(year, month);
console.log(`Días en Setiembre: ${daysInMonth}`);

const schedule = generateMonthlySchedule(INITIAL_STAFF, year, month, 'G1');
const coverage = calculateDailyCoverage(INITIAL_STAFF, schedule, year, month);

// Check Graterol
const graterol = INITIAL_STAFF.find(s => s.documentId === '4798040');
const graterolShifts = [];
for (let d = 1; d <= 30; d++) {
  graterolShifts.push(`D${d}:${schedule[graterol.id][d]}`);
}
console.log("\nTurnos de GRATEROL (esperado: D1=MT, D2=N, D3..5=D, D6=MT, D7=N...):");
console.log(graterolShifts.slice(0, 10).join(' | '));

// Check Chavez
const chavez = INITIAL_STAFF.find(s => s.documentId === '46422514');
const chavezShifts = [];
for (let d = 1; d <= 30; d++) {
  chavezShifts.push(`D${d}:${schedule[chavez.id][d]}`);
}
console.log("\nTurnos de CHAVEZ (esperado: D1=N, D2..4=D, D5=MT, D6=N...):");
console.log(chavezShifts.slice(0, 10).join(' | '));

// Check Carrera (Tecnico G1)
const carrera = INITIAL_STAFF.find(s => s.documentId === '10734450');
const carreraShifts = [];
for (let d = 1; d <= 30; d++) {
  carreraShifts.push(`D${d}:${schedule[carrera.id][d]}`);
}
console.log("\nTurnos de CARRERA (Técnico G1, esperado: D1=MT, D2=N, D3..5=D, D6=MT, D7=N...):");
console.log(carreraShifts.slice(0, 10).join(' | '));

let allOk = true;
coverage.forEach(cov => {
  if (cov.enfermeros.mt !== 2 || cov.enfermeros.n !== 2 || cov.tecnicos.mt !== 3 || cov.tecnicos.n !== 3) {
    allOk = false;
    console.error(`Error día ${cov.day}: Enf MT=${cov.enfermeros.mt}/N=${cov.enfermeros.n}, Tec MT=${cov.tecnicos.mt}/N=${cov.tecnicos.n}`);
  }
});

if (allOk) {
  console.log("\n✅ VERIFICACIÓN PERFECTA: Todos los 30 días de Setiembre tienen exactamente 2 enfermeros MT/N y 3 técnicos MT/N!");
}
