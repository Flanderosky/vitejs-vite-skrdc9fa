import React, { useState, useEffect } from 'react';
import { Clipboard, Printer } from 'lucide-react';
import PrintableReport from './PrintableReport.jsx';

export default function DictumView({
  stats,
  depositLogs,
  unverifiedLogs,
  collectLogs,
  processedLogs,
  topErrorsData,
  categoryData,
  amounts,
  successPercentage,
}) {
  // Estado local para los datos del formulario del dictamen
  const [dictumData, setDictumData] = useState({
    cliente: '',
    equipo: 'DE-100',
    serie: '',
    etv: '',
    direccion: '',
    tecnico: '',
    conclusiones: '',
  });

  // Generador Automático de Conclusiones (Efecto)
  useEffect(() => {
    // Si no hay datos, mostramos mensaje por defecto
    if (
      processedLogs.length === 0 &&
      unverifiedLogs.length === 0 &&
      collectLogs.length === 0 &&
      depositLogs.length === 0
    ) {
      setDictumData((prev) => ({
        ...prev,
        conclusiones: 'No hay datos suficientes para generar un dictamen.',
      }));
      return;
    }

    // Calculamos categoría principal de errores
    const categories = [...categoryData].sort((a, b) => b.value - a.value);
    const mainCategory = categories[0]?.name || 'General';

    // Construcción del texto del dictamen
    let text = `DICTAMEN TÉCNICO Y DE FIABILIDAD OPERATIVA:\n\n`;
    text += `Se ha realizado un análisis integral de ${stats.totalFiles} archivos (Logs, Depósitos, Cortes e Incidencias).\n`;
    text += `El equipo presenta una Tasa de Éxito en Transacciones del ${successPercentage}%, basada en ${depositLogs.length} operaciones exitosas contra ${unverifiedLogs.length} incidencias.\n\n`;

    // Conclusión Técnica
    if (processedLogs.length > 0) {
      text += `ESTADO TÉCNICO: Se registraron ${stats.totalErrors} alertas de hardware/software.\n`;
      text += `La categoría crítica es ${mainCategory}. `;
      text += `Se sugiere revisión de los sensores y módulos relacionados para evitar que estas fallas impacten la tasa de éxito.\n\n`;
    } else {
      text += `ESTADO TÉCNICO: El equipo no presenta historial de errores críticos recientes.\n\n`;
    }

    // Conclusión Financiera
    text += `BALANCE DE EFECTIVO: \n`;
    text += `- Total Ingresado (Exitoso): $${amounts.deposited.toLocaleString()} MXN\n`;
    text += `- Total Recolectado (Cortes): $${amounts.collected.toLocaleString()} MXN\n`;

    if (unverifiedLogs.length > 0) {
      text += `- ALERTA: Monto No Verificado (Riesgo): $${amounts.unverified.toLocaleString()} MXN.\n`;
      text += `Requiere conciliación inmediata.\n\n`;
    } else {
      text += `- Sin montos en riesgo (0 incidencias UNVERIFIED).\n\n`;
    }

    setDictumData((prev) => ({ ...prev, conclusiones: text }));
  }, [
    processedLogs,
    unverifiedLogs,
    collectLogs,
    depositLogs,
    stats,
    successPercentage,
    amounts,
    categoryData,
  ]);

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-xl print:shadow-none print:p-0">
      {/* Cabecera y Botones (Ocultos al imprimir) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clipboard className="text-blue-600" /> Dictamen Final
        </h2>
        <button
          onClick={handlePrint}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700"
        >
          <Printer size={18} /> Imprimir PDF
        </button>
      </div>

      {/* --- VISTA DE EDICIÓN (Visible en pantalla, oculta al imprimir) --- */}
      <div className="print:hidden">
        {/* Datos del Cliente */}
        <div className="mb-6 border-b-2 border-slate-800 pb-4">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl font-bold uppercase text-slate-800">
              Dictamen Técnico
            </h1>
            <div className="text-right">
              <p className="text-sm text-slate-500">Fecha de Emisión</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <input
              type="text"
              placeholder="Cliente..."
              className="bg-transparent border-b outline-none font-medium"
              value={dictumData.cliente}
              onChange={(e) =>
                setDictumData({ ...dictumData, cliente: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="ETV / Sucursal..."
              className="bg-transparent border-b outline-none font-medium"
              value={dictumData.etv}
              onChange={(e) =>
                setDictumData({ ...dictumData, etv: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Serie..."
              className="bg-transparent border-b outline-none font-medium"
              value={dictumData.serie}
              onChange={(e) =>
                setDictumData({ ...dictumData, serie: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Dirección..."
              className="bg-transparent border-b outline-none font-medium"
              value={dictumData.direccion}
              onChange={(e) =>
                setDictumData({ ...dictumData, direccion: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Técnico..."
              className="bg-transparent border-b outline-none font-medium"
              value={dictumData.tecnico}
              onChange={(e) =>
                setDictumData({ ...dictumData, tecnico: e.target.value })
              }
            />
          </div>
        </div>

        {/* SECCIÓN 1: DICTAMEN GENERAL */}
        <div className="mb-8">
          <h3 className="text-lg font-bold bg-slate-100 p-2 border-l-4 border-blue-600 mb-2">
            1. Conclusiones y Diagnóstico
          </h3>
          <textarea
            className="w-full h-32 p-3 border border-slate-200 rounded text-justify leading-relaxed focus:border-blue-500 outline-none resize-none text-sm"
            value={dictumData.conclusiones}
            onChange={(e) =>
              setDictumData({ ...dictumData, conclusiones: e.target.value })
            }
          />
        </div>

        {/* SECCIÓN 2: ANÁLISIS DE FIABILIDAD */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold bg-slate-100 p-2 border-l-4 border-teal-600 mb-4 flex justify-between items-center">
            <span>2. Análisis de Fiabilidad (Tasa de Éxito)</span>
            <span
              className={`text-sm font-bold text-white px-3 py-1 rounded ${
                parseFloat(successPercentage) > 95
                  ? 'bg-green-600'
                  : 'bg-yellow-500'
              }`}
            >
              Score: {successPercentage}%
            </span>
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="p-3 bg-green-50 rounded border border-green-100">
              <p className="text-xs text-slate-500 uppercase">Total Exitosos</p>
              <p className="font-bold text-green-700 text-lg">
                {depositLogs.length}
              </p>
              <p className="text-xs text-green-600 font-mono">
                ${amounts.deposited.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-100">
              <p className="text-xs text-slate-500 uppercase">
                Fallidos / Unverified
              </p>
              <p className="font-bold text-red-700 text-lg">
                {unverifiedLogs.length}
              </p>
              <p className="text-xs text-red-600 font-mono">
                ${amounts.unverified.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-xs text-slate-500 uppercase">
                Total Operaciones
              </p>
              <p className="font-bold text-blue-700 text-lg">
                {depositLogs.length + unverifiedLogs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center my-6">
          <span className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs font-bold tracking-wider">
            ANEXOS DE DETALLE
          </span>
        </div>

        {/* SECCIÓN 3: DETALLE DE RECOLECCIONES (COLLECT) */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold bg-slate-100 p-2 border-l-4 border-green-600 mb-2 flex justify-between items-center">
            <span>3. Detalle de Recolecciones (Collects)</span>
            <span className="text-sm font-normal text-green-800 bg-green-100 px-2 py-1 rounded">
              Total: ${amounts.collected.toLocaleString()}
            </span>
          </h3>
          {collectLogs.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-2 border-b">Archivo Origen</th>
                    <th className="p-2 border-b">Fecha Registro</th>
                    <th className="p-2 border-b text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {collectLogs.map((log, i) => (
                    <tr key={i} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-mono text-slate-500">
                        {log.fileName}
                      </td>
                      <td className="p-2">{log.timestamp}</td>
                      <td className="p-2 text-right font-bold font-mono">
                        ${log.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed">
              No se encontraron archivos de recolección.
            </p>
          )}
        </div>

        {/* SECCIÓN 4: DETALLE DE NO VERIFICADOS (UNVERIFIED) */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold bg-slate-100 p-2 border-l-4 border-red-600 mb-2 flex justify-between items-center">
            <span>4. Detalle de Depósitos No Verificados (Riesgo)</span>
          </h3>
          {unverifiedLogs.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-2 border-b">Archivo Origen</th>
                    <th className="p-2 border-b">Fecha Registro</th>
                    <th className="p-2 border-b text-right">Monto Est.</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedLogs.map((log, i) => (
                    <tr key={i} className="border-b hover:bg-red-50">
                      <td className="p-2 font-mono text-slate-500">
                        {log.fileName}
                      </td>
                      <td className="p-2">{log.timestamp}</td>
                      <td className="p-2 text-right font-bold font-mono text-red-600">
                        ${log.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed">
              Sin incidencias de depósitos no verificados.
            </p>
          )}
        </div>

        {/* SECCIÓN 5: DETALLE DE ERRORES (TOP 10) */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold bg-slate-100 p-2 border-l-4 border-purple-600 mb-2">
            5. Detalle de Errores Técnicos Detectados
          </h3>
          {topErrorsData.length > 0 ? (
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 border-b">Código</th>
                  <th className="p-2 border-b">Descripción Técnica</th>
                  <th className="p-2 border-b text-right">Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {topErrorsData.map((err, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="p-2 font-bold font-mono text-blue-600">
                      {err.name}
                    </td>
                    <td className="p-2">{err.desc}</td>
                    <td className="p-2 text-right font-bold">{err.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed">
              No se detectaron errores críticos en los logs.
            </p>
          )}
        </div>
      </div>

      {/* --- REPORTE IMPRIMIBLE (Oculto en pantalla, visible al imprimir) --- */}
      <PrintableReport
        dictumData={dictumData}
        stats={stats}
        amounts={amounts}
        successPercentage={successPercentage}
        topErrorsData={topErrorsData}
        unverifiedLogs={unverifiedLogs}
      />
    </div>
  );
}
