import React, { useRef } from 'react';
import { UploadCloud, FolderInput, RefreshCw, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function UploadSection({
  isProcessing,
  progress,
  stats,
  onUpload,
  unverifiedCount,
  depositCount,
}) {
  const fileInputRef = useRef(null);

  // Función para disparar el input oculto
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="glass-panel rounded-2xl p-1 mb-8 relative group">
      {/* Borde animado sutil */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
      
      <div className="relative bg-slate-950/80 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          {/* ZONA DE ACCIÓN PRINCIPAL */}
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              <FolderInput className="text-cyan-400" />
              Ingesta de Datos
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Selecciona la carpeta raíz con los logs (.txt, .log). El sistema detectará automáticamente los lotes de 5000+ archivos.
            </p>

            <button
              onClick={handleButtonClick}
              disabled={isProcessing}
              className={`relative group/btn overflow-hidden rounded-xl px-8 py-4 font-bold tracking-wider text-white shadow-lg transition-all 
                ${isProcessing 
                  ? 'bg-slate-800 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-[1.02] hover:shadow-cyan-500/20'
                }`}
            >
              <div className="absolute inset-0 bg-white/20 group-hover/btn:translate-x-full transition-transform duration-500 ease-out skew-x-12"></div>
              <span className="relative flex items-center gap-3">
                {isProcessing ? <RefreshCw className="animate-spin" /> : <UploadCloud />}
                {isProcessing ? 'PROCESANDO LOTE...' : 'SELECCIONAR CARPETA'}
              </span>
            </button>

            {/* INPUT INVISIBLE CON SOPORTE PARA CARPETAS */}
            <input
              type="file"
              ref={fileInputRef}
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={onUpload}
            />
          </div>

          {/* PANEL DE ESTADÍSTICAS EN TIEMPO REAL */}
          <div className="w-full md:w-1/2 bg-slate-900/50 rounded-xl border border-slate-800 p-5">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-mono text-cyan-400">
                  <span>ANALIZANDO ESTRUCTURA...</span>
                  <span className="animate-pulse">{progress}%</span>
                </div>
                {/* Barra de progreso Neon */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center text-slate-500 animate-pulse">
                  Descomprimiendo flujo de datos masivo...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Archivos Totales */}
                <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Total Archivos</p>
                      <p className="text-lg font-mono text-white">{stats.totalFiles > 0 ? stats.totalFiles.toLocaleString() : '---'}</p>
                    </div>
                  </div>
                  {stats.totalFiles > 0 && <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span>}
                </div>

                {/* Depósitos OK */}
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs text-emerald-500/80 font-bold uppercase">Verificados</span>
                  </div>
                  <p className="text-xl font-mono text-emerald-400">{depositCount}</p>
                </div>

                {/* Alertas */}
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/10 hover:border-rose-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertOctagon size={14} className="text-rose-500" />
                    <span className="text-xs text-rose-500/80 font-bold uppercase">Alertas</span>
                  </div>
                  <p className="text-xl font-mono text-rose-400">{unverifiedCount}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}