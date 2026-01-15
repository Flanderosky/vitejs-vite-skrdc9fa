import React from 'react';
import { TrendingUp, CheckSquare, AlertOctagon } from 'lucide-react';

export default function StatsCards({
  successPercentage,
  depositLogs,
  unverifiedLogs,
  amounts,
}) {
  if (depositLogs.length === 0 && unverifiedLogs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Tasa de Éxito */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
        <div
          className={`p-3 rounded-full ${
            parseFloat(successPercentage) > 95
              ? 'bg-green-100 text-green-600'
              : 'bg-yellow-100 text-yellow-600'
          }`}
        >
          <TrendingUp size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-bold uppercase">
            Tasa de Éxito
          </p>
          <p className="text-3xl font-bold text-slate-800">
            {successPercentage}%
          </p>
          <p className="text-xs text-slate-400">Fiabilidad Operativa</p>
        </div>
      </div>

      {/* Total Depositado */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="bg-green-100 p-3 rounded-full text-green-600">
          <CheckSquare size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-bold uppercase">
            Total Depositado
          </p>
          <p className="text-2xl font-bold text-green-700">
            ${amounts.deposited.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">
            {depositLogs.length} eventos exitosos
          </p>
        </div>
      </div>

      {/* No Verificado */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <AlertOctagon size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-bold uppercase">
            Monto No Verificado
          </p>
          <p className="text-2xl font-bold text-red-700">
            ${amounts.unverified.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">
            {unverifiedLogs.length} fallos / riesgos
          </p>
        </div>
      </div>
    </div>
  );
}
