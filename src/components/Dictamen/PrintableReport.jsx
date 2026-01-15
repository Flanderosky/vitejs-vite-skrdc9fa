import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export default function PrintableReport({
  dictumData,
  stats,
  amounts,
  successPercentage,
  topErrorsData,
  unverifiedLogs,
  reportId, // Nuevo: Recibimos el ID desde el padre
}) {
  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    // ID para que la librería lo encuentre.
    // Quitamos 'hidden' y usamos estilos inline para asegurar el ancho en el PDF
    <div
      id="printable-report-content"
      className="bg-white p-8 max-w-[800px] mx-auto text-slate-900"
    >
      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">
            Informe Técnico
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Análisis de Fiabilidad DE-100
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end text-slate-600 mb-1">
            <Calendar size={16} />
            <span className="text-sm font-medium capitalize">
              {currentDate}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">ID: {reportId}</p>
        </div>
      </div>

      {/* --- DATOS DEL CLIENTE --- */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6 text-sm">
        <h3 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider border-b border-slate-200 pb-1">
          Información del Sitio
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">
              Cliente / Razón Social
            </span>
            <span className="font-bold text-slate-900 text-base">
              {dictumData.cliente || '---'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">
              Sucursal / ETV
            </span>
            <span className="font-bold text-slate-900">
              {dictumData.etv || '---'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">
              Serie / Modelo
            </span>
            <span className="font-mono font-medium">
              {dictumData.serie || '---'} / DE-100
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">
              Dirección
            </span>
            <span className="font-medium truncate">
              {dictumData.direccion || '---'}
            </span>
          </div>
        </div>
      </div>

      {/* --- KPI SUMMARY --- */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-slate-200 rounded p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Fiabilidad
            </span>
            {parseFloat(successPercentage) > 95 ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <AlertTriangle size={18} className="text-yellow-500" />
            )}
          </div>
          <span className="text-2xl font-bold text-slate-800">
            {successPercentage}%
          </span>
        </div>

        <div className="border border-slate-200 rounded p-3 flex flex-col justify-between bg-slate-50">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Procesado
            </span>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <span className="text-xl font-bold text-slate-800">
            ${(amounts.deposited + amounts.collected).toLocaleString()}
          </span>
        </div>

        <div
          className={`border rounded p-3 flex flex-col justify-between ${
            amounts.unverified > 0
              ? 'border-red-200 bg-red-50'
              : 'border-slate-200'
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-red-700 uppercase">
              Riesgo
            </span>
            <AlertOctagon
              size={18}
              className={
                amounts.unverified > 0 ? 'text-red-600' : 'text-slate-300'
              }
            />
          </div>
          <span
            className={`text-xl font-bold ${
              amounts.unverified > 0 ? 'text-red-700' : 'text-slate-400'
            }`}
          >
            ${amounts.unverified.toLocaleString()}
          </span>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL (Para evitar cortes, usamos un layout fluido) --- */}
      <div className="space-y-6">
        {/* Diagnóstico */}
        <div>
          <h3 className="font-bold text-slate-800 border-b-2 border-slate-800 mb-2 pb-1 text-sm">
            1. Diagnóstico y Conclusiones
          </h3>
          <div className="bg-white border border-slate-200 p-3 rounded text-justify text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
            {dictumData.conclusiones || 'Sin conclusiones registradas.'}
          </div>
        </div>

        {/* Top Errores */}
        {topErrorsData.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-800 border-b-2 border-slate-800 mb-2 pb-1 text-sm">
              2. Errores Críticos Recurrentes
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-2 border-b">Código</th>
                  <th className="p-2 border-b">Descripción</th>
                  <th className="p-2 border-b text-right">Frec.</th>
                </tr>
              </thead>
              <tbody>
                {topErrorsData.slice(0, 5).map((err, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-mono font-bold text-slate-700">
                      {err.name}
                    </td>
                    <td className="p-2 text-slate-600">
                      {err.desc.substring(0, 60)}...
                    </td>
                    <td className="p-2 text-right font-medium">{err.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Alertas */}
        {unverifiedLogs.length > 0 && (
          <div>
            <h3 className="font-bold text-red-700 border-b-2 border-red-700 mb-2 pb-1 text-sm">
              3. Alertas de Riesgo
            </h3>
            <div className="border border-red-200 rounded p-3 bg-red-50 text-xs text-red-800">
              <p>
                <strong>ATENCIÓN:</strong> Se detectaron{' '}
                <strong>{unverifiedLogs.length} eventos no verificados</strong>.
              </p>
              <p>
                Monto implicado:{' '}
                <strong>${amounts.unverified.toLocaleString()} MXN</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- FIRMAS (Footer Fluido) --- */}
      {/* Usamos mt-12 para empujarlo hacia abajo pero sin fijarlo, así no corta tablas */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="flex justify-between items-end">
          <div className="w-5/12 text-center">
            <div className="border-b border-black mb-2 h-1"></div>
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Recibido Por
            </p>
            <p className="text-xs font-bold mt-1 text-slate-400">
              {dictumData.cliente || '(Firma Cliente)'}
            </p>
          </div>
          <div className="w-5/12 text-center">
            <div className="border-b border-black mb-2 h-1"></div>
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Elaborado Por
            </p>
            <p className="text-xs font-bold mt-1 uppercase text-slate-900">
              Irving Sammer Gonzalez
            </p>
          </div>
        </div>
        <div className="text-center mt-6 text-[10px] text-slate-300">
          Reporte generado automáticamente por DE-100 Log Analyzer
        </div>
      </div>
    </div>
  );
}
