export const ROLES = {
  ENFERMERO: 'ENFERMERO', // Licenciado/a Profesional
  TECNICO: 'TECNICO',     // Técnico/a en Enfermería
};

export const ROLE_LABELS = {
  [ROLES.ENFERMERO]: 'Enfermero(a) - Hospitalización Piso 4',
  [ROLES.TECNICO]: 'Técnico(a) de Enfermería',
};

export const DEFAULT_CLINIC_INFO = {
  sede: 'SAN BORJA - TORRE HOSPITALARIA',
  area: 'HOSPITALIZACION 4TO PISO',
  defaultYear: 2026,
  defaultMonth: 9 // Setiembre
};

export const SHIFTS = {
  MT: {
    code: 'D', // In hospital Excel, Day shift is labeled D (Diurno / MT)
    altCode: 'MT',
    name: 'Turno Día (12h: 8:00 am a 8:00 pm)',
    hours: 12,
    time: '8:00 am - 8:00 pm',
    color: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200',
    badge: 'bg-amber-500 text-white',
    printBg: '#fef3c7',
    printColor: '#78350f'
  },
  N: {
    code: 'N',
    altCode: 'N',
    name: 'Turno Noche (12h: 8:00 pm a 8:00 am)',
    hours: 12,
    time: '8:00 pm - 8:00 am',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200',
    badge: 'bg-indigo-600 text-white',
    printBg: '#e0e7ff',
    printColor: '#312e81'
  },
  D: {
    code: 'LIBRE',
    altCode: '',
    name: 'Descanso (Libre - 3 días)',
    hours: 0,
    time: 'Libre',
    color: 'bg-white text-transparent border-slate-100 hover:bg-slate-50',
    badge: 'bg-slate-300 text-white',
    printBg: '#ffffff',
    printColor: '#94a3b8'
  },
  VAC: {
    code: 'VAC',
    altCode: 'VAC',
    name: 'Vacaciones',
    hours: 0,
    time: 'Periodo Vacacional',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200',
    badge: 'bg-emerald-500 text-white',
    printBg: '#d1fae5',
    printColor: '#065f46'
  },
  DM: {
    code: 'DM',
    altCode: 'DM',
    name: 'Descanso Médico / Licencia',
    hours: 0,
    time: 'Licencia Médica',
    color: 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200',
    badge: 'bg-rose-500 text-white',
    printBg: '#ffe4e6',
    printColor: '#9f1239'
  }
};

/**
 * Exact Staff list from Clinic Image:
 * Sede: SAN BORJA - TORRE HOSPITALARIA
 * Area: HOSPITALIZACION 4TO PISO
 */
export const INITIAL_STAFF = [
  // --- 10 ENFERMEROS PROFESIONALES (Hospitalización Piso 4) ---
  // Guardia G1 (Inicia D el día 1, N el día 2)
  {
    id: 'enf-4798040',
    documentId: '4798040',
    name: 'GRATEROL GUTIERREZ GABRIELA LEONOR',
    role: ROLES.ENFERMERO,
    group: 'G1',
    status: 'ACTIVO',
    phone: '987-100-001',
    email: 'gabriela.graterol@hospital.pe'
  },
  {
    id: 'enf-44292047',
    documentId: '44292047',
    name: 'ALCANTARA DAGA PAOLO CESAR',
    role: ROLES.ENFERMERO,
    group: 'G1',
    status: 'ACTIVO',
    phone: '987-100-002',
    email: 'paolo.alcantara@hospital.pe'
  },

  // Guardia G2 (Inicia D el día 2, N el día 3)
  {
    id: 'enf-4619105',
    documentId: '4619105',
    name: 'BRACHO VIVAS ANTONIETA PASTORA',
    role: ROLES.ENFERMERO,
    group: 'G2',
    status: 'ACTIVO',
    phone: '987-100-003',
    email: 'antonieta.bracho@hospital.pe'
  },
  {
    id: 'enf-45556902',
    documentId: '45556902',
    name: 'TICONA CHIPAO JESSICA',
    role: ROLES.ENFERMERO,
    group: 'G2',
    status: 'ACTIVO',
    phone: '987-100-004',
    email: 'jessica.ticona@hospital.pe'
  },

  // Guardia G3 (Inicia D el día 3, N el día 4)
  {
    id: 'enf-1722440',
    documentId: '1722440',
    name: 'MARIN APONTE ANGELY PATRICIA',
    role: ROLES.ENFERMERO,
    group: 'G3',
    status: 'ACTIVO',
    phone: '987-100-005',
    email: 'angely.marin@hospital.pe'
  },
  {
    id: 'enf-73511225',
    documentId: '73511225',
    name: 'PAYANO GONZALEZ LUCERO YULIANA',
    role: ROLES.ENFERMERO,
    group: 'G3',
    status: 'ACTIVO',
    phone: '987-100-006',
    email: 'lucero.payano@hospital.pe'
  },

  // Guardia G4 (Inicia D el día 4, N el día 5)
  {
    id: 'enf-44548979',
    documentId: '44548979',
    name: 'ZAPATA MORENO MAYRA',
    role: ROLES.ENFERMERO,
    group: 'G4',
    status: 'ACTIVO',
    phone: '987-100-007',
    email: 'mayra.zapata@hospital.pe'
  },
  {
    id: 'enf-42218382',
    documentId: '42218382',
    name: 'PAREDES VELARDE WILFREDO EDUARDO',
    role: ROLES.ENFERMERO,
    group: 'G4',
    status: 'ACTIVO',
    phone: '987-100-008',
    email: 'wilfredo.paredes@hospital.pe'
  },

  // Guardia G5 (Inicia N el día 1, D el día 5)
  {
    id: 'enf-46422514',
    documentId: '46422514',
    name: 'CHAVEZ GUTIERREZ SUSANA',
    role: ROLES.ENFERMERO,
    group: 'G5',
    status: 'ACTIVO',
    phone: '987-100-009',
    email: 'susana.chavez@hospital.pe'
  },
  {
    id: 'enf-45567866',
    documentId: '45567866',
    name: 'DE LA ROSA SOTO GESSENIA',
    role: ROLES.ENFERMERO,
    group: 'G5',
    status: 'ACTIVO',
    phone: '987-100-010',
    email: 'gessenia.delarosa@hospital.pe'
  },

  // --- 14 TÉCNICOS EN ENFERMERÍA (San Borja - Torre Hospitalaria) ---
  // Rotación Guardia G3 (Inicia D el día 3, N el día 4)
  {
    id: 'tec-10734450',
    documentId: '10734450',
    name: 'CARRERA NICHO MIRIAM BEATRIZ',
    role: ROLES.TECNICO,
    group: 'G3',
    status: 'ACTIVO',
    phone: '988-200-001',
    email: 'miriam.carrera@hospital.pe'
  },
  {
    id: 'tec-44307427',
    documentId: '44307427',
    name: 'MARISOL ESCOBAR SALVATIERRA',
    role: ROLES.TECNICO,
    group: 'G3',
    status: 'ACTIVO',
    phone: '988-200-002',
    email: 'marisol.escobar@hospital.pe'
  },
  {
    id: 'tec-74384322',
    documentId: '74384322',
    name: 'MANYARI TICLIA DEYSI',
    role: ROLES.TECNICO,
    group: 'G3',
    status: 'ACTIVO',
    phone: '988-200-003',
    email: 'deysi.manyari@hospital.pe'
  },

  // Rotación Guardia G4 (Inicia D el día 4, N el día 5)
  {
    id: 'tec-72875995',
    documentId: '72875995',
    name: 'LESLY LUCERO GONZALES RAMOS',
    role: ROLES.TECNICO,
    group: 'G4',
    status: 'ACTIVO',
    phone: '988-200-004',
    email: 'lesly.gonzales@hospital.pe'
  },
  {
    id: 'tec-44661843',
    documentId: '44661843',
    name: 'RONDINEL AT EVELYN NOEMI',
    role: ROLES.TECNICO,
    group: 'G4',
    status: 'ACTIVO',
    phone: '988-200-005',
    email: 'evelyn.rondinel@hospital.pe'
  },
  {
    id: 'tec-25767164',
    documentId: '25767164',
    name: 'MARCHAND COZ LILI GIOVANNA',
    role: ROLES.TECNICO,
    group: 'G4',
    status: 'ACTIVO',
    phone: '988-200-006',
    email: 'lili.marchand@hospital.pe'
  },

  // Rotación Guardia G5 (Inicia N el día 1, D el día 5, N el día 6)
  {
    id: 'tec-42935496',
    documentId: '42935496',
    name: 'AVALOS QUINTANA SAIDA',
    role: ROLES.TECNICO,
    group: 'G5',
    status: 'ACTIVO',
    phone: '988-200-007',
    email: 'saida.avalos@hospital.pe'
  },
  {
    id: 'tec-8490584',
    documentId: '8490584',
    name: 'YATACO AGUIRRE FLOR DE MARIA',
    role: ROLES.TECNICO,
    group: 'G5',
    status: 'ACTIVO',
    phone: '988-200-008',
    email: 'flor.yataco@hospital.pe'
  },
  {
    id: 'tec-40558637',
    documentId: '40558637',
    name: 'CONCE DAVID SILVIA',
    role: ROLES.TECNICO,
    group: 'G5',
    status: 'ACTIVO',
    phone: '988-200-009',
    email: 'silvia.conce@hospital.pe'
  },

  // Rotación Guardia G1 (Inicia D el día 1, N el día 2, D el día 6)
  {
    id: 'tec-74865123',
    documentId: '74865123',
    name: 'ORBE PANDURO BRIGIDA ESTHER',
    role: ROLES.TECNICO,
    group: 'G1',
    status: 'ACTIVO',
    phone: '988-200-010',
    email: 'brigida.orbe@hospital.pe'
  },
  {
    id: 'tec-41341091',
    documentId: '41341091',
    name: 'QUISPE HUAMAN YUDITH',
    role: ROLES.TECNICO,
    group: 'G1',
    status: 'ACTIVO',
    phone: '988-200-011',
    email: 'yudith.quispe@hospital.pe'
  },

  // Rotación Guardia G2 (Inicia D el día 2, N el día 3, D el día 7)
  {
    id: 'tec-40398603',
    documentId: '40398603',
    name: 'TACURI PARIHUAMAN ELISABETH',
    role: ROLES.TECNICO,
    group: 'G2',
    status: 'ACTIVO',
    phone: '988-200-012',
    email: 'elisabeth.tacuri@hospital.pe'
  },
  {
    id: 'tec-46311847',
    documentId: '46311847',
    name: 'SUBILETE MARCAÑAUPA BEATRIZ',
    role: ROLES.TECNICO,
    group: 'G2',
    status: 'ACTIVO',
    phone: '988-200-013',
    email: 'beatriz.subilete@hospital.pe'
  },
  {
    id: 'tec-43347560',
    documentId: '43347560',
    name: 'MARIA ESTHER CHIPANA LLACCHUA',
    role: ROLES.TECNICO,
    group: 'G2',
    status: 'ACTIVO',
    phone: '988-200-014',
    email: 'maria.chipana@hospital.pe'
  }
];
