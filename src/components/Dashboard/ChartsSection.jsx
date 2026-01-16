import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, PieChart as PieIcon } from 'lucide-react';

const ChartTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
    <Icon size={18} className="text-cyan-400" />
    <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-300 text-xs font-mono mb-2 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: entry.color || entry.fill }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsSection({
  successRateData,
  topErrorsData,
  errorTrendData,
  hasErrors,
}) {
  // Solo ocultamos si de verdad no hay NADA de data (ni errores ni transacciones)
  if (!hasErrors && successRateData.length === 0) return null;

  // Colores para el Pie Chart
  const COLORS = ['#10b981', '#f43f5e']; // Esmeralda (Éxito), Rosa (Fallo)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. Tasa de Éxito (Donut Chart) */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <ChartTitle icon={PieIcon} title="Ratio de Operaciones" />
        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={successRateData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {successRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Errores (Bar Chart Horizontal) */}
      <div className="glass-panel rounded-2xl p-6">
        <ChartTitle icon={AlertTriangle} title="Frecuencia de Errores" />
        {topErrorsData && topErrorsData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topErrorsData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar 
                  dataKey="count" 
                  name="Ocurrencias" 
                  fill="#22d3ee" 
                  radius={[0, 4, 4, 0]} 
                  barSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-xl">
            SISTEMA ESTABLE: 0 ERRORES
          </div>
        )}
      </div>

      {/* 3. Tendencia de Errores (Area Chart) */}
      {/* Solo mostramos este panel si hay historial de errores */}
      {errorTrendData && errorTrendData.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <ChartTitle icon={TrendingUp} title="Línea de Tiempo de Incidencias" />
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={errorTrendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Errores"
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}