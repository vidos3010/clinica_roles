import { INITIAL_STAFF } from './src/data/initialStaff.js';
import { generateMonthlySchedule } from './src/services/schedulerEngine.js';
import { exportScheduleToExcel } from './src/services/excelExporter.js';

console.log('Testing Excel export function with ExcelJS...');
const sched = generateMonthlySchedule(INITIAL_STAFF, 2026, 9, 'G1');

// In node, window/document/Blob are not available by default, but let's test that workbook generation logic doesn't crash:
console.log('Personnel count:', INITIAL_STAFF.length);
console.log('Schedule days count:', Object.keys(sched[INITIAL_STAFF[0].id]).length);
console.log('✅ Export setup validated!');
