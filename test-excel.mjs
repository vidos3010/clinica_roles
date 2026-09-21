import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
wb.creator = 'MediTurnos Pro';
const ws = wb.addWorksheet('Test_Design');

ws.mergeCells('A1:K1');
const titleCell = ws.getCell('A1');
titleCell.value = 'HOSPITAL / CLÍNICA — SAN BORJA (TORRE HOSPITALARIA)';
titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
ws.getRow(1).height = 28;

// Test cell
const dayCell = ws.getCell('B3');
dayCell.value = 'MT';
dayCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF78350F' } };
dayCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
dayCell.alignment = { vertical: 'middle', horizontal: 'center' };
dayCell.border = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};

await wb.xlsx.writeFile('test_output.xlsx');
console.log('✅ ExcelJS test written successfully!');
