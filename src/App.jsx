import React from 'react';
import {
  Activity,
  BarChart2,
  Clipboard,
  FileText,
  Database,
} from 'lucide-react';

// Importamos sin extensiones para que Vite lo resuelva automáticamnete
// Asegúrate de que tus archivos en "hooks" y "components" existan
import { useLogAnalysis } from './hooks/useLogAnalysis.js';

import StatsCards from './components/Dashboard/StatsCards.jsx'; // Está en carpeta Dashboard
import ChartsSection from './components/Dashboard/ChartsSection.jsx'; // Está en carpeta Dashboard
import UploadSection from './components/Dashboard/UploadSection.jsx'; // Está en carpeta Dashboard
import ConfigView from './components/Config/ConfigView.jsx'; // Está en carpeta Config
import LogTable from './components/Shared/LogTable.jsx'; // Está en carpeta Shared
import DictumView from './components/Dictamen/DictumView.jsx';
export default function App() {
  const {
    activeTab,
    setActiveTab,
    matrixData,
    processedLogs,
    unverifiedLogs,
    collectLogs,
    depositLogs,
    isProcessing,
    progress,
    stats,
    topErrorsData,
    errorTrendData,
    categoryData,
    amounts,
    successRateData,
    successPercentage,
    processMatrixFile,
    processLogFiles,
  } = useLogAnalysis();

  // Combinamos todos los logs para la vista de tabla
  const allLogs = [
    ...collectLogs,
    ...depositLogs,
    ...unverifiedLogs,
    ...processedLogs,
  ];

  // Manejadores de eventos simples (sin tipos de TS)
  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processLogFiles(Array.from(e.target.files));
    }
  };

  const handleMatrixUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processMatrixFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans print:bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400" />
            <h1 className="text-xl font-bold">DE-100 Log Analyzer</h1>
          </div>
          <div className="text-sm text-slate-400">v4.2 - Modular JSX</div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="container mx-auto flex gap-4 px-4 overflow-x-auto">
          <NavButton
            id="dashboard"
            label="Dashboard"
            icon={<BarChart2 size={18} />}
            activeTab={activeTab}
            setTab={setActiveTab}
          />
          <NavButton
            id="dictamen"
            label="Dictamen"
            icon={<Clipboard size={18} />}
            activeTab={activeTab}
            setTab={setActiveTab}
          />
          <NavButton
            id="logs"
            label="Detalles Crudos"
            icon={<FileText size={18} />}
            activeTab={activeTab}
            setTab={setActiveTab}
          />
          <NavButton
            id="config"
            label="Configuración"
            icon={<Database size={18} />}
            activeTab={activeTab}
            setTab={setActiveTab}
          />
        </div>
      </nav>

      <main className="container mx-auto p-6 print:p-0">
        {activeTab === 'config' && (
          <ConfigView matrixData={matrixData} onUpload={handleMatrixUpload} />
        )}

        {activeTab === 'dashboard' && (
          <>
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
          </>
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

// Botón de navegación auxiliar simple (sin TypeScript interface)
function NavButton({ id, label, icon, activeTab, setTab }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setTab(id)}
      className={`py-4 px-2 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors
        ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
      {icon} {label}
    </button>
  );
}
