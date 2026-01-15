import React, { useRef } from 'react';
import { Database, Upload } from 'lucide-react';

export default function ConfigView({ matrixData, onUpload }) {
  const inputRef = useRef(null);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Database className="text-blue-600" /> Cargar Matriz
      </h2>
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:bg-slate-50"
        onClick={() => inputRef.current.click()}
      >
        <Upload className="mx-auto text-slate-400 mb-4" size={48} />
        <p className="font-medium text-lg text-slate-700">
          Cargar CSV de Matriz
        </p>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={inputRef}
          onChange={onUpload}
        />
      </div>
      {matrixData.length > 0 && (
        <div className="mt-4 text-green-600 font-bold">
          ✅ Matriz activa ({matrixData.length} códigos cargados)
        </div>
      )}
    </div>
  );
}
