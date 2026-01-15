import React, { useRef } from 'react';
import { Upload, RefreshCw, AlertOctagon } from 'lucide-react';

export default function UploadSection({
  isProcessing,
  progress,
  stats,
  onUpload,
  unverifiedCount,
  depositCount,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Carga de Datos</h2>
        {unverifiedCount > 0 && (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <AlertOctagon size={16} /> {unverifiedCount} Alertas
          </span>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          {isProcessing ? <RefreshCw className="animate-spin" /> : <Upload />}
          Subir Carpeta Completa
        </button>
        <input
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={onUpload}
        />

        {stats.totalFiles > 0 && (
          <div className="text-sm text-slate-600 flex gap-4">
            <span>
              Archivos: <b>{stats.totalFiles}</b>
            </span>
            <span>
              Depósitos: <b className="text-green-600">{depositCount}</b>
            </span>
            <span>
              Errores: <b className="text-blue-600">{stats.totalErrors}</b>
            </span>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="w-full bg-slate-200 h-2 mt-4 rounded-full">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
