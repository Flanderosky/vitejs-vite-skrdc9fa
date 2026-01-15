import React from 'react';

export default function LogTable({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-bold mb-4">Registro Completo de Archivos</h3>
      <div className="h-96 overflow-y-auto border border-slate-200 rounded">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="p-2">Tipo</th>
              <th className="p-2">Archivo</th>
              <th className="p-2">Fecha/Info</th>
              <th className="p-2 text-right">Monto / Errores</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log, i) => (
              <tr key={i}>
                <td className="p-2">
                  {log.type === 'collect' && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                      COLLECT
                    </span>
                  )}
                  {log.type === 'deposit' && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">
                      DEPOSIT
                    </span>
                  )}
                  {log.type === 'unverified' && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                      UNVERIF
                    </span>
                  )}
                  {log.type === 'error_log' && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                      ERROR
                    </span>
                  )}
                </td>
                <td className="p-2 font-mono text-xs">{log.fileName}</td>
                <td className="p-2 text-xs">{log.timestamp}</td>
                <td className="p-2 text-right font-mono">
                  {log.amount !== undefined
                    ? `$${log.amount.toLocaleString()}`
                    : `${log.errorCount || 0} errs`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
