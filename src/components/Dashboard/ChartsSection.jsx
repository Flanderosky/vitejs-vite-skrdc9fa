import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { CHART_COLORS, SUCCESS_COLORS } from '../../utils/constants';

export default function ChartsSection({
  successRateData,
  topErrorsData,
  errorTrendData,
  hasErrors,
}) {
  return (
    <div className="space-y-6">
      {/* Fila 1: Circular y Barras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico Circular: Éxito */}
        {successRateData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
            <h3 className="font-bold mb-2 text-center text-slate-700 flex justify-center items-center gap-2">
              <CheckCircle size={18} className="text-green-600" /> Efectividad
              de Depósitos
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {successRateData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SUCCESS_COLORS[index % SUCCESS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Barras: Errores */}
        {hasErrors && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
            <h3 className="font-bold mb-4 text-slate-700 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> Top
              Frecuencia de Errores
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topErrorsData}
                layout="vertical"
                margin={{ left: 40, right: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={60}
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                  name="Frecuencia"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Fila 2: Tendencia de Errores (Línea) */}
      {hasErrors && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="font-bold mb-6 text-slate-700 flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" /> Tendencia de
            Errores en el Tiempo
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={errorTrendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Cantidad de Errores"
                stroke="#8884d8"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Muestra la cantidad de errores agrupados por día.
          </p>
        </div>
      )}
    </div>
  );
}
