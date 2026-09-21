import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import TodayDashboard from './components/TodayDashboard.jsx';
import ScheduleHeader from './components/ScheduleHeader.jsx';
import ScheduleMatrix from './components/ScheduleMatrix.jsx';
import PersonnelManager from './components/PersonnelManager.jsx';
import CoverageSummary from './components/CoverageSummary.jsx';
import PrintScheduleView from './components/PrintScheduleView.jsx';
import PdfReportModal from './components/PdfReportModal.jsx';
import RotationProposalModal from './components/RotationProposalModal.jsx';
import ReplacementAssistantModal from './components/ReplacementAssistantModal.jsx';

import { storageService } from './services/storageService.js';
import { generateMonthlySchedule, generateScheduleFromDay, getContinuityStartGroup, getDaysInMonth } from './services/schedulerEngine.js';
import { exportScheduleToExcel } from './services/excelExporter.js';
import { DEFAULT_CLINIC_INFO, ROLES } from './data/initialStaff.js';
import { getCompleteOfficialSeptemberSchedule } from './data/officialSeptSchedule.js';

export default function App() {
  // PÁGINA PRINCIPAL POR DEFECTO: 'today' (Guardia de Hoy)
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'schedule' | 'staff' | 'stats'
  
  // Date state: Default to Setiembre 2026
  const [year, setYear] = useState(DEFAULT_CLINIC_INFO.defaultYear);
  const [month, setMonth] = useState(DEFAULT_CLINIC_INFO.defaultMonth);
  const [startGroup, setStartGroup] = useState(() => getContinuityStartGroup(DEFAULT_CLINIC_INFO.defaultYear, DEFAULT_CLINIC_INFO.defaultMonth));
  const [clinicInfo, setClinicInfo] = useState(DEFAULT_CLINIC_INFO);
  const [displayStyle, setDisplayStyle] = useState('MT_N'); // 'MT_N' por defecto
  
  // Table enhancements: 'modern' (Color Suave) por defecto
  const [colorTheme, setColorTheme] = useState('modern'); // 'modern' (Color Suave)
  const [density, setDensity] = useState('compact');       // 'compact' or 'comfortable'
  const [searchFilter, setSearchFilter] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Auto-save & Rotation Proposal states
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [autoSaveToast, setAutoSaveToast] = useState(null);

  // Intelligent Replacement Assistant states (Rule: 2 LE / 3 TE)
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [replacementDeficitData, setReplacementDeficitData] = useState(null);

  const triggerAutoSaveFeedback = useCallback((msg = 'Cambio guardado automáticamente') => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setAutoSaveToast(msg);
      setTimeout(() => setAutoSaveToast(null), 3000);
    }, 250);
  }, []);

  // Staff state (24 official staff: 10 nurses, 14 technicians)
  const [staffList, setStaffList] = useState(() => storageService.getStaff());

  // Helper to get or generate schedule for any given month & year
  const getOrGenerateSchedule = useCallback((y, m, group, currentStaff) => {
    const saved = storageService.getSchedule(y, m);
    const days = getDaysInMonth(y, m);
    
    // Validate that saved schedule is complete for this month and has staff
    const isValid = saved && Object.keys(saved).length > 0 &&
      currentStaff.length > 0 &&
      currentStaff.every(s => saved[s.id] && saved[s.id][days] !== undefined);

    if (isValid) return saved;

    // Setiembre 2026 default: exact official schedule from hospital image
    if (Number(y) === 2026 && Number(m) === 9) {
      const official = getCompleteOfficialSeptemberSchedule(currentStaff);
      storageService.saveSchedule(y, m, official);
      return official;
    }

    const generated = generateMonthlySchedule(currentStaff, y, m, group);
    storageService.saveSchedule(y, m, generated);
    return generated;
  }, []);

  // Schedule state: initialized cleanly with exact official September schedule
  const [schedule, setSchedule] = useState(() => {
    const defaultStaff = storageService.getStaff();
    const saved = storageService.getSchedule(DEFAULT_CLINIC_INFO.defaultYear, DEFAULT_CLINIC_INFO.defaultMonth);
    if (saved) return saved;
    const initialOfficial = getCompleteOfficialSeptemberSchedule(defaultStaff);
    storageService.saveSchedule(DEFAULT_CLINIC_INFO.defaultYear, DEFAULT_CLINIC_INFO.defaultMonth, initialOfficial);
    return initialOfficial;
  });

  // ATOMIC Month and Year Change: Guarantees zero race conditions or missing days
  const handleMonthYearChange = useCallback((newYear, newMonth, manualStartGroup = null) => {
    const autoGroup = manualStartGroup || getContinuityStartGroup(newYear, newMonth);
    const newSchedule = getOrGenerateSchedule(newYear, newMonth, autoGroup, staffList);

    setYear(newYear);
    setMonth(newMonth);
    setStartGroup(autoGroup);
    setSchedule(newSchedule);
    triggerAutoSaveFeedback();
  }, [staffList, getOrGenerateSchedule, triggerAutoSaveFeedback]);

  // Manually change start group and regenerate for current month
  const handleStartGroupChange = (newGroup) => {
    setStartGroup(newGroup);
    const generated = generateMonthlySchedule(staffList, year, month, newGroup);
    setSchedule(generated);
    storageService.saveSchedule(year, month, generated);
    triggerAutoSaveFeedback('Rol actualizado con nueva guardia inicial');
  };

  // Regenerate Schedule for current month with algorithmic rotation
  const handleGenerate = () => {
    const generated = generateMonthlySchedule(staffList, year, month, startGroup);
    setSchedule(generated);
    storageService.saveSchedule(year, month, generated);
    triggerAutoSaveFeedback('Rol mensual generado automáticamente');
  };

  // Load exact official September 2026 schedule from clinic document
  const handleLoadOfficialSeptember = () => {
    const official = getCompleteOfficialSeptemberSchedule(staffList);
    setSchedule(official);
    storageService.saveSchedule(2026, 9, official);
    triggerAutoSaveFeedback('Rol oficial de Setiembre 2026 cargado');
  };

  // Update single cell shift & offer rotation proposal or replacement assistant
  const handleUpdateShift = (staffId, dayNumber, shiftCode) => {
    const oldShift = schedule?.[staffId]?.[dayNumber] || 'D';

    // 1. Immediately apply and save single cell
    setSchedule(prev => {
      const updated = {
        ...prev,
        [staffId]: {
          ...(prev?.[staffId] || {}),
          [dayNumber]: shiftCode
        }
      };
      storageService.saveSchedule(year, month, updated);
      return updated;
    });

    triggerAutoSaveFeedback();

    const staffMember = staffList.find(s => s.id === staffId);
    if (!staffMember || oldShift === shiftCode) return;

    // 2. CHECK FOR COVERAGE DEFICIT:
    // If user changed an active duty shift (MT or N) to a non-duty (D, VAC, DM, etc.)
    if (oldShift === 'MT' || oldShift === 'N') {
      const role = staffMember.role;
      const targetCount = role === ROLES.ENFERMERO ? 2 : 3;

      let remainingCount = 0;
      staffList.forEach(s => {
        if (s.role === role && s.status === 'ACTIVO') {
          const current = (s.id === staffId) ? shiftCode : (schedule?.[s.id]?.[dayNumber] || 'D');
          if (current === oldShift) remainingCount++;
        }
      });

      if (remainingCount < targetCount) {
        // Automatic Replacement Assistant trigger!
        setReplacementDeficitData({
          dayNumber,
          role,
          shift: oldShift,
          currentCount: remainingCount,
          targetCount,
          reason: `${staffMember.name} pasó de ${oldShift} a ${shiftCode}`
        });
        setIsReplacementModalOpen(true);
        return;
      }
    }

    // 3. Otherwise, open rotation proposal modal to project the 5-day cycle forward
    setProposalData({
      staff: staffMember,
      dayNumber,
      newShift: shiftCode,
      oldShift
    });
    setIsProposalModalOpen(true);
  };

  // Open Replacement Assistant manually or from table totals click
  const handleOpenReplacementAssistant = (deficitInfo) => {
    setReplacementDeficitData(deficitInfo);
    setIsReplacementModalOpen(true);
  };

  // Assign replacement candidate
  const handleAssignReplacement = (staffId, dayNumber, shiftCode) => {
    setSchedule(prev => {
      const updated = {
        ...prev,
        [staffId]: {
          ...(prev?.[staffId] || {}),
          [dayNumber]: shiftCode
        }
      };
      storageService.saveSchedule(year, month, updated);
      return updated;
    });
    const cand = staffList.find(s => s.id === staffId);
    triggerAutoSaveFeedback(`Reemplazo asignado: ${cand?.name || 'Colaborador'} en Día ${dayNumber} (${shiftCode})`);
  };

  // Apply rotation to this individual staff member from dayNumber to month end
  const handleApplyIndividualRotation = (staffId, individualProjection) => {
    setSchedule(prev => {
      const updated = {
        ...prev,
        [staffId]: {
          ...(prev?.[staffId] || {}),
          ...individualProjection
        }
      };
      storageService.saveSchedule(year, month, updated);
      return updated;
    });
    triggerAutoSaveFeedback('Rotación continua aplicada al colaborador');
  };

  // Recalculate whole ward from fromDay onwards
  const handleApplyGlobalFromDay = (fromDay, targetGroup) => {
    const newSched = generateScheduleFromDay(schedule, staffList, year, month, fromDay, targetGroup);
    setSchedule(newSched);
    storageService.saveSchedule(year, month, newSched);
    triggerAutoSaveFeedback(`Rotación del servicio actualizada desde el Día ${fromDay}`);
  };

  const handleKeepSingleDay = () => {
    triggerAutoSaveFeedback(`Guardado cambio puntual del Día ${proposalData?.dayNumber || ''}`);
  };

  // Save staff (new or edit)
  const handleSaveStaff = (staffMember) => {
    const existingIndex = staffList.findIndex(s => s.id === staffMember.id);
    let updatedStaff;
    if (existingIndex >= 0) {
      updatedStaff = [...staffList];
      updatedStaff[existingIndex] = staffMember;
    } else {
      updatedStaff = [staffMember, ...staffList];
    }
    setStaffList(updatedStaff);
    storageService.saveStaff(updatedStaff);

    const updatedSchedule = (Number(year) === 2026 && Number(month) === 9)
      ? getCompleteOfficialSeptemberSchedule(updatedStaff)
      : generateMonthlySchedule(updatedStaff, year, month, startGroup);
    setSchedule(updatedSchedule);
    storageService.saveSchedule(year, month, updatedSchedule);
    triggerAutoSaveFeedback('Colaborador guardado');
  };

  // Delete staff
  const handleDeleteStaff = (staffId) => {
    const updatedStaff = staffList.filter(s => s.id !== staffId);
    setStaffList(updatedStaff);
    storageService.saveStaff(updatedStaff);

    setSchedule(prev => {
      const updatedSchedule = { ...prev };
      delete updatedSchedule[staffId];
      storageService.saveSchedule(year, month, updatedSchedule);
      return updatedSchedule;
    });
    triggerAutoSaveFeedback('Colaborador eliminado');
  };

  // Reset to default clinic staff (San Borja Hospitalización 4to Piso)
  const handleResetStaff = () => {
    if (confirm('¿Restablecer con el personal oficial de Hospitalización 4to Piso (San Borja)?')) {
      const defaults = storageService.resetStaffToDefault();
      setStaffList(defaults);
      const newSchedule = (Number(year) === 2026 && Number(month) === 9)
        ? getCompleteOfficialSeptemberSchedule(defaults)
        : generateMonthlySchedule(defaults, year, month, startGroup);
      setSchedule(newSchedule);
      storageService.saveSchedule(year, month, newSchedule);
    }
  };

  // Clear current month schedule
  const handleClearSchedule = () => {
    if (confirm('¿Deseas limpiar todos los turnos asignados de este mes?')) {
      const emptySchedule = {};
      staffList.forEach(s => {
        emptySchedule[s.id] = {};
      });
      setSchedule(emptySchedule);
      storageService.saveSchedule(year, month, emptySchedule);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportScheduleToExcel(staffList, schedule, year, month, clinicInfo, displayStyle);
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  // Backup handlers
  const handleExportBackup = () => {
    storageService.exportBackup();
  };

  const handleImportBackup = (jsonData) => {
    const res = storageService.importBackup(jsonData);
    if (res.success) {
      const newStaff = storageService.getStaff();
      setStaffList(newStaff);
      const newSchedule = getOrGenerateSchedule(year, month, startGroup, newStaff);
      setSchedule(newSchedule);
      alert(`Restauración exitosa: ${res.count} colaboradores cargados.`);
    } else {
      alert(`Error al restaurar: ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetStaff}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5 no-print overflow-x-hidden">
        {activeTab === 'today' && (
          <TodayDashboard
            staffList={staffList}
            schedule={schedule}
            year={year}
            month={month}
            clinicInfo={clinicInfo}
            onNavigateToSchedule={() => setActiveTab('schedule')}
            onMonthYearChange={handleMonthYearChange}
          />
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <ScheduleHeader
              year={year}
              month={month}
              totalDays={getDaysInMonth(year, month)}
              onMonthYearChange={handleMonthYearChange}
              startGroup={startGroup}
              setStartGroup={handleStartGroupChange}
              clinicInfo={clinicInfo}
              displayStyle={displayStyle}
              setDisplayStyle={setDisplayStyle}
              colorTheme={colorTheme}
              setColorTheme={setColorTheme}
              density={density}
              setDensity={setDensity}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              onGenerate={handleGenerate}
              onLoadOfficial={handleLoadOfficialSeptember}
              onExportExcel={handleExportExcel}
              onPrint={() => setIsPdfModalOpen(true)}
              onClear={handleClearSchedule}
              saveStatus={saveStatus}
              onApplyGlobalFromDay={handleApplyGlobalFromDay}
            />

            <ScheduleMatrix
              staffList={staffList}
              schedule={schedule}
              year={year}
              month={month}
              displayStyle={displayStyle}
              colorTheme={colorTheme}
              density={density}
              searchFilter={searchFilter}
              onUpdateShift={handleUpdateShift}
              onOpenReplacementAssistant={handleOpenReplacementAssistant}
            />
          </div>
        )}

        {activeTab === 'staff' && (
          <PersonnelManager
            staffList={staffList}
            schedule={schedule}
            year={year}
            month={month}
            displayStyle={displayStyle}
            onSaveStaff={handleSaveStaff}
            onDeleteStaff={handleDeleteStaff}
            onResetStaff={handleResetStaff}
          />
        )}

        {activeTab === 'stats' && (
          <CoverageSummary
            staffList={staffList}
            schedule={schedule}
            year={year}
            month={month}
            onOpenReplacementAssistant={handleOpenReplacementAssistant}
          />
        )}
      </main>

      {/* Printable Sheet (Rendered only during window.print()) */}
      <PrintScheduleView
        staffList={staffList}
        schedule={schedule}
        year={year}
        month={month}
        clinicInfo={clinicInfo}
        displayStyle={displayStyle}
      />

      {/* Interactive PDF Preview Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        staffList={staffList}
        schedule={schedule}
        year={year}
        month={month}
        clinicInfo={clinicInfo}
        displayStyle={displayStyle}
        onExportExcel={handleExportExcel}
      />

      {/* Interactive Rotation Proposal Modal (Appears upon shift change or manual trigger) */}
      <RotationProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        proposalData={proposalData}
        year={year}
        month={month}
        totalDays={getDaysInMonth(year, month)}
        displayStyle={displayStyle}
        onApplyIndividual={handleApplyIndividualRotation}
        onApplyGlobalFromDay={handleApplyGlobalFromDay}
        onKeepSingleDay={handleKeepSingleDay}
      />

      {/* Intelligent Replacement Assistant Modal (Rule: 2 LE / 3 TE) */}
      <ReplacementAssistantModal
        isOpen={isReplacementModalOpen}
        onClose={() => setIsReplacementModalOpen(false)}
        deficitData={replacementDeficitData}
        staffList={staffList}
        schedule={schedule}
        year={year}
        month={month}
        displayStyle={displayStyle}
        onAssignReplacement={handleAssignReplacement}
      />

      {/* Floating Auto-save confirmation notification */}
      {autoSaveToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#001848] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-blue-400/40 animate-in slide-in-from-bottom duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>✓ {autoSaveToast}</span>
        </div>
      )}
    </div>
  );
}
