import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Users, BarChart3, Stethoscope, Download, Upload, RotateCcw, MoreVertical, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onExportBackup, onImportBackup, onResetData }) {
  const fileInputRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result);
        onImportBackup(json);
      } catch (err) {
        alert('Archivo JSON no válido.');
      }
    };
    reader.readAsText(file);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-[1560px] mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">MediTurnos</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                San Borja • Hospitalización 4to Piso
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Responsive Scrollable on Mobile */}
          <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'today'
                  ? 'bg-white text-[#002060] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span className="hidden sm:inline">Guardia de Hoy</span>
              <span className="sm:hidden">Hoy</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'schedule'
                  ? 'bg-white text-[#002060] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span className="hidden sm:inline">Rol Mensual</span>
              <span className="sm:hidden">Rol</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'staff'
                  ? 'bg-white text-[#002060] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
              <span className="hidden sm:inline">Registro Personal</span>
              <span className="sm:hidden">Personal</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-white text-[#002060] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              <span>Métricas</span>
            </button>
          </nav>

          {/* Desktop Actions: Backup & Reset */}
          <div className="hidden lg:flex items-center space-x-1 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restaurar copia de seguridad"
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Restaurar</span>
            </button>
            <button
              onClick={onExportBackup}
              title="Exportar respaldo de datos en JSON"
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Copia JSON</span>
            </button>
            <button
              onClick={onResetData}
              title="Restablecer plantilla inicial oficial de 24 trabajadores"
              className="px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Restablecer</span>
            </button>
          </div>

          {/* Mobile Actions Menu Button */}
          <div className="lg:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Más opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Opciones del Sistema
                </div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer text-left"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Restaurar Copia (.json)</span>
                </button>
                <button
                  onClick={() => {
                    onExportBackup();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer text-left"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Descargar Copia (.json)</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    onResetData();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer text-left"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  <span>Restablecer Plantilla</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
