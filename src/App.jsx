import React from 'react';
import { Activity, BarChart2, Clipboard, FileText, Database } from 'lucide-react';
import { useLogAnalysis } from './hooks/useLogAnalysis.js';

// Componentes
import StatsCards from './components/Dashboard/StatsCards.jsx';
import ChartsSection from './components/Dashboard/ChartsSection.jsx';
import UploadSection from './components/Dashboard/UploadSection.jsx';
import ConfigView from './components/Config/ConfigView.jsx';
import LogTable from './components/Shared/LogTable.jsx';
import DictumView from './components/Dictamen/DictumView.jsx';

export default function App() {
  const {
    activeTab, setActiveTab, matrixData, processedLogs, unverifiedLogs,
    collectLogs, depositLogs, isProcessing, progress, stats,
    topErrorsData, errorTrendData, categoryData, amounts,
    successRateData, successPercentage, processMatrixFile, processLogFiles,
  } = useLogAnalysis();

  const allLogs = [...collectLogs, ...depositLogs, ...unverifiedLogs, ...processedLogs];

  const handleUpload = (e) => {
    // Array.from convierte la FileList (carpeta) en array manejable
    if (e.target.files && e.target.files.length > 0) {
      processLogFiles(Array.from(e.target.files));
    }
  };

  const handleMatrixUpload = (e) => {
    if (e.target.files && e.target.files[0]) processMatrixFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
      
      {/* Header Glass */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Activity className="relative text-cyan-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DE-100 <span className="font-light text-cyan-500">Analyzer</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ONLINE v4.2
          </div>
        </div>

        {/* Navbar Integrada */}
        <nav className="container mx-auto px-6 mt-2">
          <div className="flex gap-8 overflow-x-auto pb-1 scrollbar-hide">
            <NavButton id="dashboard" label="Dashboard" icon={<BarChart2 size={18} />} activeTab={activeTab} setTab={setActiveTab} />
            <NavButton id="dictamen" label="Dictamen" icon={<Clipboard size={18} />} activeTab={activeTab} setTab={setActiveTab} />
            <NavButton id="logs" label="Data Logs" icon={<FileText size={18} />} activeTab={activeTab} setTab={setActiveTab} />
            <NavButton id="config" label="Configuración" icon={<Database size={18} />} activeTab={activeTab} setTab={setActiveTab} />
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-6 animate-in fade-in zoom-in duration-500">
        {activeTab === 'config' && <ConfigView matrixData={matrixData} onUpload={handleMatrixUpload} />}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <UploadSection
              isProcessing={isProcessing}
              progress={progress}
              stats={stats}
              onUpload={handleUpload}
              unverifiedCount={unverifiedLogs.length}
              depositCount={depositLogs.length}
            />
            <StatsCards
              successPercentage={successPercentage}
              depositLogs={depositLogs}
              unverifiedLogs={unverifiedLogs}
              amounts={amounts}
            />
            <ChartsSection
              successRateData={successRateData}
              topErrorsData={topErrorsData}
              errorTrendData={errorTrendData}
              hasErrors={processedLogs.length > 0}
            />
          </div>
        )}

        {activeTab === 'dictamen' && (
          <DictumView
            stats={stats}
            depositLogs={depositLogs}
            unverifiedLogs={unverifiedLogs}
            collectLogs={collectLogs}
            processedLogs={processedLogs}
            topErrorsData={topErrorsData}
            categoryData={categoryData}
            amounts={amounts}
            successPercentage={successPercentage}
          />
        )}

        {activeTab === 'logs' && <LogTable logs={allLogs} />}
      </main>
    </div>
  );
}

// Botón de Navegación con efecto "Glow"
function NavButton({ id, label, icon, activeTab, setTab }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setTab(id)}
      className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 transition-all duration-300 relative group
        ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
      <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
      {label}
      <span className={`absolute bottom-0 left-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full transition-all duration-300 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'}`}></span>
    </button>
  );
}