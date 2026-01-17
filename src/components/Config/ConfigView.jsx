import React, { useRef } from 'react';
import { Database, Upload, FileJson } from 'lucide-react';

export default function ConfigView({ matrixData, onUpload }) {
  const inputRef = useRef(null);

  return (
    <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto border border-slate-800 relative overflow-hidden">
       {/* Glow de fondo */}
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
       
       <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <Database className="text-cyan-400" size={24} />
         </div>
         <div>
            <h2 className="text-xl font-bold text-white">Configuración de Matriz</h2>
            <p className="text-slate-400 text-sm">Carga la base de datos de errores conocidos</p>
         </div>
       </div>

      <div
        className="group border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300"
        onClick={() => inputRef.current.click()}
      >
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/50">
            <Upload className="text-slate-400 group-hover:text-cyan-400 transition-colors" size={24} />
        </div>
        
        <p className="font-medium text-lg text-slate-200 mb-2">
          Cargar archivo CSV / JSON
        </p>
        <p className="text-sm text-slate-500">
          Arrastra o haz click para actualizar la base de conocimiento
        </p>
        
        <input
          type="file"
          accept=".csv,.json"
          className="hidden"
          ref={inputRef}
          onChange={onUpload}
        />
      </div>

      {matrixData.length > 0 && (
        <div className="mt-6 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <FileJson className="text-emerald-500" />
          <div>
              <p className="text-emerald-400 font-bold text-sm">Matriz Activa</p>
              <p className="text-emerald-500/70 text-xs">{matrixData.length} códigos de error cargados en memoria.</p>
          </div>
        </div>
      )}
    </div>
  );
}