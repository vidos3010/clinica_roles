import { INITIAL_STAFF } from '../data/initialStaff.js';
import { getCompleteOfficialSeptemberSchedule } from '../data/officialSeptSchedule.js';

const STORAGE_KEYS = {
  STAFF: 'clinica_staff_san_borja_v3',
  SCHEDULE_PREFIX: 'clinica_schedule_san_borja_v3_',
  CONFIG: 'clinica_config_v3'
};

export const storageService = {
  // --- Personnel Methods ---
  getStaff() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove any placeholder if legacy exists
          return parsed.filter(s => s.id !== 'tec-47890123');
        }
      }
    } catch (e) {
      console.warn('Error reading staff from localStorage:', e);
    }
    // Default to San Borja official staff (10 nurses, 14 technicians)
    return [...INITIAL_STAFF];
  },

  saveStaff(staffList) {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
      return true;
    } catch (e) {
      console.error('Error saving staff to localStorage:', e);
      return false;
    }
  },

  resetStaffToDefault() {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
      return [...INITIAL_STAFF];
    } catch (e) {
      console.error('Error resetting staff:', e);
      return [...INITIAL_STAFF];
    }
  },

  // --- Schedule Methods ---
  getSchedule(year, month) {
    try {
      const key = `${STORAGE_KEYS.SCHEDULE_PREFIX}${year}_${month}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Error reading schedule for ${year}-${month}:`, e);
    }
    return null;
  },

  saveSchedule(year, month, scheduleData) {
    try {
      const key = `${STORAGE_KEYS.SCHEDULE_PREFIX}${year}_${month}`;
      localStorage.setItem(key, JSON.stringify(scheduleData));
      return true;
    } catch (e) {
      console.error(`Error saving schedule for ${year}-${month}:`, e);
      return false;
    }
  },

  clearSchedule(year, month) {
    try {
      const key = `${STORAGE_KEYS.SCHEDULE_PREFIX}${year}_${month}`;
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  getOfficialSeptemberSchedule(staffList) {
    return getCompleteOfficialSeptemberSchedule(staffList || this.getStaff());
  },

  // --- Export & Import Entire System Data ---
  exportBackup() {
    const data = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      staff: this.getStaff(),
      schedules: {}
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.SCHEDULE_PREFIX)) {
          data.schedules[key] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      }
    } catch (e) {
      console.warn('Error bundling schedules:', e);
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Respaldo_Turnos_SanBorja_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.staff && Array.isArray(parsed.staff)) {
        this.saveStaff(parsed.staff.filter(s => s.id !== 'tec-47890123'));
      }
      if (parsed.schedules && typeof parsed.schedules === 'object') {
        Object.entries(parsed.schedules).forEach(([key, val]) => {
          localStorage.setItem(key, JSON.stringify(val));
        });
      }
      return { success: true, count: parsed.staff?.length || 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
