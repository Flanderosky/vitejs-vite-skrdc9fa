import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Calendar,
  Wrench,
  Settings,
  Search,
  FileText
} from 'lucide-react';

export default function PrintableReport({
  dictumData,
  stats,
  amounts,
  successPercentage,
  topErrorsData,
  unverifiedLogs = [], // Por defecto array vacío para evitar errores
  reportId,
  incidencesList = [], // Lista de aclaraciones acumuladas
  maintenance // Objeto con datos de rodillos/servicios
}) {
  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Cálculos para el resumen financiero de incidencias
  const totalClaimed = incidencesList.reduce((acc, curr) => acc + (parseFloat(curr.diffAmount) || 0), 0);
  const totalJustified = incidencesList.reduce((acc, curr) => curr.isJustified ? acc + (parseFloat(curr.diffAmount) || 0) : acc, 0);

  return (
    <div
      id="printable-report-content"
      className="bg-white p-8 max-w-[800px] mx-auto text-slate-900 font-sans"
    >
      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">
            Informe Técnico Consolidado
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Dictamen de Fiabilidad y Mantenimiento DE-100
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end text-slate-600 mb-1">
            <Calendar size={16} />
            <span className="text-sm font-medium capitalize">
              {currentDate}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">ID: {reportId || 'N/A'}</p>
        </div>
      </div>

      {/* --- DATOS DEL CLIENTE --- */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6 text-sm">
        <h3 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider border-b border-slate-200 pb-1">
          Información del Sitio
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Cliente / Razón Social</span>
            <span className="font-bold text-slate-900">{dictumData.cliente || '---'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Sucursal / ETV</span>
            <span className="font-bold text-slate-900">{dictumData.etv || '---'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Serie / Modelo</span>
            <span className="font-mono font-medium">{dictumData.serie || '---'} / DE-100</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Dirección</span>
            <span className="font-medium truncate">{dictumData.direccion || '---'}</span>
          </div>
        </div>
      </div>

      {/* --- KPI SUMMARY (Semáforos) --- */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Fiabilidad */}
        <div className="border border-slate-200 rounded p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Fiabilidad</span>
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

        {/* Procesado */}
        <div className="border border-slate-200 rounded p-3 flex flex-col justify-between bg-slate-50">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Procesado</span>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <span className="text-xl font-bold text-slate-800">
            ${(amounts.deposited + amounts.collected).toLocaleString()}
          </span>
        </div>

        {/* Riesgo */}
        <div
          className={`border rounded p-3 flex flex-col justify-between ${
            amounts.unverified > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200'
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-red-700 uppercase">Riesgo</span>
            <AlertOctagon
              size={18}
              className={amounts.unverified > 0 ? 'text-red-600' : 'text-slate-300'}
            />
          </div>
          <span className={`text-xl font-bold ${amounts.unverified > 0 ? 'text-red-700' : 'text-slate-400'}`}>
            ${amounts.unverified.toLocaleString()}
          </span>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="space-y-6">
        
        {/* 1. Diagnóstico */}
        <div>
          <h3 className="font-bold text-slate-800 border-b-2 border-slate-800 mb-2 pb-1 text-sm">
            1. Diagnóstico y Conclusiones
          </h3>
          <div className="bg-white border border-slate-200 p-3 rounded text-justify text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
            {dictumData.conclusiones || 'Sin conclusiones registradas.'}
          </div>
        </div>

        {/* 2. Top Errores */}
        {topErrorsData.length > 0 && (
          <div className="break-inside-avoid">
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

        {/* 3. Detalle de Riesgos (Opcional, si hay unverified) */}
        {unverifiedLogs.length > 0 && (
            <div className="break-inside-avoid">
                <h3 className="font-bold text-red-800 border-b-2 border-red-800 mb-2 pb-1 text-sm">
                    3. Detalle de Alertas de Riesgo (Unverified)
                </h3>
                <div className="border border-red-200 rounded overflow-hidden">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-red-50 text-red-700 font-bold">
                            <tr>
                                <th className="p-2">Archivo</th>
                                <th className="p-2">Fecha</th>
                                <th className="p-2 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unverifiedLogs.slice(0, 5).map((log, i) => (
                                <tr key={i} className="border-b border-red-100">
                                    <td className="p-2 font-mono text-slate-600">{log.fileName}</td>
                                    <td className="p-2">{log.timestamp}</td>
                                    <td className="p-2 text-right font-bold text-red-600">${log.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {unverifiedLogs.length > 5 && (
                        <p className="p-2 text-[10px] text-center text-slate-500 bg-slate-50">
                            ... y {unverifiedLogs.length - 5} eventos más.
                        </p>
                    )}
                </div>
            </div>
        )}

        {/* 4. LISTA DE ACLARACIONES (CARRITO) */}
        {incidencesList && incidencesList.length > 0 && (
          <div className="break-inside-avoid mt-4">
            <h3 className="font-bold text-slate-800 border-b-2 border-slate-800 mb-2 pb-1 text-sm flex justify-between items-center">
              <span className="flex items-center gap-2">
                 4. Aclaraciones y Faltantes Reportados
              </span>
              <span className="text-[10px] font-normal bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                Total Casos: {incidencesList.length}
              </span>
            </h3>
            
            {/* Resumen Financiero de Incidencias */}
            <div className="flex gap-4 mb-4 text-xs">
                <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <p className="text-slate-500 uppercase text-[10px]">Monto Reclamado</p>
                    <p className="font-bold text-lg">${totalClaimed.toLocaleString()}</p>
                </div>
                <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded text-center">
                    <p className="text-green-700 uppercase text-[10px]">Monto Justificado</p>
                    <p className="font-bold text-lg text-green-700">${totalJustified.toLocaleString()}</p>
                </div>
                <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded text-center">
                    <p className="text-red-700 uppercase text-[10px]">No Procede (Diferencia)</p>
                    <p className="font-bold text-lg text-red-700">${(totalClaimed - totalJustified).toLocaleString()}</p>
                </div>
            </div>

            {/* Tabla Detallada */}
            <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-slate-800 text-white uppercase font-bold">
                    <tr>
                        <th className="p-2">Folio Acta</th>
                        <th className="p-2">Fecha Reportada</th>
                        <th className="p-2 text-right">Monto</th>
                        <th className="p-2">Análisis Técnico</th>
                        <th className="p-2 text-center">Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    {incidencesList.map((inc, i) => (
                        <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="p-2 font-bold font-mono text-slate-700">
                                {inc.folio}
                                {inc.isOCR && <span className="ml-1 text-[8px] text-blue-500">(OCR)</span>}
                            </td>
                            <td className="p-2">{inc.date ? new Date(inc.date).toLocaleDateString() : '---'}</td>
                            <td className="p-2 text-right font-medium">${parseFloat(inc.diffAmount).toLocaleString()}</td>
                            <td className="p-2 text-slate-600 italic leading-tight w-1/3">
                                {inc.shortConclusion || inc.conclusionText?.substring(0,50)}
                            </td>
                            <td className="p-2 text-center">
                                {inc.isJustified 
                                    ? <span className="text-[10px] font-bold border border-green-600 text-green-700 px-1 rounded bg-green-50">JUSTIFICADO</span>
                                    : <span className="text-[10px] font-bold border border-red-300 text-red-600 px-1 rounded bg-red-50">NO PROCEDE</span>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}

        {/* 5. PLAN DE MANTENIMIENTO */}
        {maintenance && (maintenance.requiresRollers || maintenance.requiresServices) && (
           <div className="break-inside-avoid mt-6 border-t-2 border-blue-900 pt-4">
               <h3 className="font-bold text-blue-900 mb-3 pb-1 text-sm flex items-center gap-2 uppercase tracking-wide">
                   <Settings size={18}/> 5. Acciones de Mantenimiento Requeridas
               </h3>
               
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   {/* Justificación */}
                   <div className="mb-4 pb-2 border-b border-blue-200">
                       <p className="text-[10px] font-bold text-blue-400 uppercase">Justificación Técnica del Servicio</p>
                       <p className="text-sm font-medium text-blue-900">
                           {maintenance.reason || 'Mantenimiento correctivo por desgaste operativo.'}
                       </p>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                       {/* Tarjeta Rodillos */}
                       {maintenance.requiresRollers && (
                           <div className="flex-1 bg-white p-3 rounded-lg border border-orange-200 flex items-center gap-3 shadow-sm">
                               <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                                   <Settings size={24}/>
                               </div>
                               <div>
                                   <p className="font-bold text-sm text-slate-800 uppercase">Cambio de Kit de Rodillos</p>
                                   <p className="text-xs text-slate-500 mt-1">
                                       Reemplazo necesario por fin de vida útil y corrección de fallas de alimentación.
                                   </p>
                               </div>
                           </div>
                       )}

                       {/* Tarjeta Servicios */}
                       {maintenance.requiresServices && (
                           <div className="flex-1 bg-white p-3 rounded-lg border border-blue-200 flex items-center gap-3 shadow-sm">
                               <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                   <Wrench size={24}/>
                               </div>
                               <div>
                                   <p className="font-bold text-sm text-slate-800 uppercase">
                                       {maintenance.serviceCount} Servicios Preventivos
                                   </p>
                                   <p className="text-xs text-slate-500 mt-1">
                                       Limpieza profunda y calibración de sensores por alta carga de trabajo.
                                   </p>
                               </div>
                           </div>
                       )}
                   </div>
               </div>
           </div>
        )}

      </div>
      
      {/* --- FOOTER SIMPLIFICADO (SIN FIRMAS) --- */}
      <div className="mt-12 pt-4 border-t border-slate-100 break-inside-avoid text-center">
        <p className="text-[10px] text-slate-300 font-mono">
          Dictamen generado automáticamente por DE-100 Log Analyzer - v3.5 (OCR Support)
        </p>
      </div>
    </div>
  );
}