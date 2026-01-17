import React from 'react';
import { Box, Truck, Calendar, ShieldCheck } from 'lucide-react';

export default function AssetList({ assets, onSelect }) {
  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="text-cyan-400" /> Inventario de Activos
          </h2>
          <p className="text-slate-400">Gestión de flota, pólizas y asignación de ETVs</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-cyan-900/20">
          + Nuevo Equipo
        </button>
      </div>

      {/* Grid de Equipos */}
      <div className="grid grid-cols-1 gap-4">
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            onClick={() => onSelect(asset)}
            className={`glass-panel p-6 rounded-xl border transition-all group cursor-pointer relative overflow-hidden
              ${asset.status === 'inactive' ? 'border-slate-800 bg-slate-950/30 opacity-60' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-cyan-500/30'}`}
          >
            {/* Efecto Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col md:flex-row justify-between gap-4 relative z-10">
              
              {/* Info Principal */}
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                  ${asset.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 
                    asset.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Box size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    {asset.serial}
                    {asset.status === 'inactive' && <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-500">BAJA</span>}
                  </h3>
                  <p className="text-cyan-400 text-sm font-mono">{asset.model} • {asset.client}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                    <Truck size={12} /> ETV: {asset.etv} | Sucursal: {asset.branch}
                  </div>
                </div>
              </div>

              {/* Estado de Póliza */}
              <div className="flex flex-col md:items-end gap-2">
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
                    <ShieldCheck size={14} className="text-purple-400" />
                    <span className="text-slate-300">{asset.contract.type}</span>
                 </div>
                 
                 <div className="text-right">
                    <p className="text-xs text-slate-500">Renovación</p>
                    <div className="flex items-center gap-1 text-slate-300 font-mono text-sm">
                        <Calendar size={14} /> {asset.contract.renovationDate}
                    </div>
                 </div>
              </div>
            </div>

            {/* Barra de Mantenimientos */}
            {asset.status !== 'inactive' && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 relative z-10">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Visitas: {asset.contract.visitsCompleted} / {asset.contract.visitsPerYear}</span>
                        <span>Progreso Anual</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" 
                            style={{ width: `${(asset.contract.visitsCompleted / asset.contract.visitsPerYear) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}