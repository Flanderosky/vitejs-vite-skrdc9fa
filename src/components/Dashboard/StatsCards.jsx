import React from 'react';
import { TrendingUp, CheckSquare, AlertOctagon } from 'lucide-react';

export default function StatsCards({
  successPercentage,
  depositLogs,
  unverifiedLogs,
  amounts,
}) {
  if (depositLogs.length === 0 && unverifiedLogs.length === 0) return null;

  const pct = parseFloat(successPercentage);
  const isHighSuccess = pct > 95;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Tasa de Éxito - Estilo Neon Verde/Amarillo */}
      <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-6 transition-all hover:border-white/10 hover:bg-slate-800/50">
        <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${isHighSuccess ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div
            className={`p-4 rounded-xl shadow-lg ring-1 ring-inset ${
              isHighSuccess
                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 shadow-emerald-500/10'
                : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20 shadow-yellow-500/10'
            }`}
          >
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-1">
              Eficiencia Operativa
            </p>
            <p className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              {successPercentage}<span className="text-lg text-slate-500 ml-1">%</span>
            </p>
            <p className={`text-xs mt-1 font-medium ${isHighSuccess ? 'text-emerald-500' : 'text-yellow-500'}`}>
              {isHighSuccess ? 'Sistema Óptimo' : 'Atención Requerida'}
            </p>
          </div>
        </div>
      </div>

      {/* Total Depositado - Estilo Neon Azul/Cyan */}
      <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-6 transition-all hover:border-white/10 hover:bg-slate-800/50">
        <div className="absolute top-0 right-0 p-20 bg-cyan-500 rounded-full blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-inset ring-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <CheckSquare size={32} />
          </div>
          <div>
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-1">
              Total Procesado
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              ${amounts.deposited.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <p className="text-xs text-slate-400">
                {depositLogs.length} eventos verificados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* No Verificado - Estilo Neon Rojo/Rosa */}
      <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-6 transition-all hover:border-white/10 hover:bg-slate-800/50">
        <div className="absolute top-0 right-0 p-20 bg-rose-500 rounded-full blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20 shadow-lg shadow-rose-500/10">
            <AlertOctagon size={32} />
          </div>
          <div>
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-1">
              Riesgo Detectado
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              ${amounts.unverified.toLocaleString()}
            </p>
            <p className="text-xs text-rose-400/80 mt-1 font-medium">
              {unverifiedLogs.length} incidentes críticos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}