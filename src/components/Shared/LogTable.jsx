import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LogTable({ logs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrado simple
  const filteredLogs = logs.filter((log) =>
    JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      {/* Header de la Tabla con Buscador */}
      <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Registro de Eventos
          <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {logs.length} Total
          </span>
        </h3>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar ID, monto..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contenido Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-mono">
              <th className="p-4 font-medium border-b border-slate-800">Fecha/Hora</th>
              <th className="p-4 font-medium border-b border-slate-800">Descripción</th>
              <th className="p-4 font-medium border-b border-slate-800 text-right">Monto</th>
              <th className="p-4 font-medium border-b border-slate-800 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-cyan-500/5 transition-colors group"
                >
                  <td className="p-4 text-slate-400 text-sm font-mono whitespace-nowrap group-hover:text-slate-300">
                    {log.date || 'N/A'} <span className="text-slate-600">|</span> {log.time || '--:--'}
                  </td>
                  <td className="p-4 text-slate-300 text-sm max-w-md truncate" title={log.description}>
                    {log.description}
                  </td>
                  <td className="p-4 text-slate-200 text-sm font-mono text-right tracking-tight">
                    {log.amount ? `$${parseFloat(log.amount).toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={log.status || (log.isVerified ? 'verified' : 'error')} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 italic">
                  No se encontraron datos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="p-3 bg-slate-900/50 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
        <span>Página {currentPage} de {totalPages || 1}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Badge Auxiliar
function StatusBadge({ status }) {
  const styles = {
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    deposit: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    unverified: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
    default: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const normalized = status?.toLowerCase().includes('deposit') ? 'deposit' : 
                     status?.toLowerCase().includes('unverified') ? 'unverified' :
                     status?.toLowerCase().includes('error') ? 'error' : 
                     styles[status] ? status : 'default';

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[normalized] || styles.default} inline-block min-w-[80px] text-center`}>
      {status || 'Unknown'}
    </span>
  );
}