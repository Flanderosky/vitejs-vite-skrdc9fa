import React, { useState, useEffect } from 'react';
import { Clipboard, Download, FileText, CheckCircle, XCircle, Eye, EyeOff, AlertTriangle, Search, Plus, Trash2, Wrench, Settings } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import PrintableReport from './PrintableReport.jsx';
import { parseIncidencePDF, analyzeDiscrepancy } from '../../utils/incidenceParser';

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
  // Estado para formulario principal
  const [dictumData, setDictumData] = useState({
    cliente: '',
    equipo: 'DE-100',
    serie: '',
    etv: '',
    direccion: '',
    tecnico: '',
    conclusiones: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // --- NUEVO: ESTADO PARA MANTENIMIENTO Y REFACCIONES ---
  const [maintenance, setMaintenance] = useState({
    requiresRollers: false,   // Cambio de Rodillos
    requiresServices: false,  // Servicios adicionales
    serviceCount: 2,          // Por defecto 2 servicios como te pidieron
    reason: 'Alta Carga de Trabajo y Desgaste Operativo' // Justificación default
  });

  // Lista de incidencias (Carrito de Aclaraciones)
  const [incidencesList, setIncidencesList] = useState([]);

  // Formulario manual de incidencias
  const [manualData, setManualData] = useState({
    folio: '',
    diffAmount: '',
    collectAmount: '',
    date: '',
    hasPdf: false,
    rawText: ''
  });

  const [validationResult, setValidationResult] = useState(null);

  // 1. GENERADOR DE CONCLUSIONES
  useEffect(() => {
    generateConclusions();
  }, [processedLogs, unverifiedLogs, collectLogs, depositLogs, incidencesList]); 

  const generateConclusions = () => {
    if (processedLogs.length === 0 && unverifiedLogs.length === 0 && collectLogs.length === 0 && incidencesList.length === 0) {
       if (!dictumData.conclusiones) setDictumData(prev => ({ ...prev, conclusiones: 'No hay datos suficientes.' }));
       return;
    }

    const categories = [...categoryData].sort((a, b) => b.value - a.value);
    const mainCategory = categories[0]?.name || 'General';

    let text = `DICTAMEN TÉCNICO Y DE FIABILIDAD OPERATIVA:\n\n`;
    text += `Se ha realizado un análisis integral de ${stats.totalFiles} archivos. Tasa de Éxito: ${successPercentage}%.\n\n`;

    text += processedLogs.length > 0 
      ? `ESTADO TÉCNICO: Se registraron ${stats.totalErrors} alertas. Categoría principal: ${mainCategory}.\n`
      : `ESTADO TÉCNICO: Equipo sin historial reciente de errores críticos.\n`;

    text += `BALANCE DE EFECTIVO:\n`;
    text += `- Ingresado: $${amounts.deposited.toLocaleString()} MXN\n`;
    text += `- Riesgo (Unverified): $${amounts.unverified.toLocaleString()} MXN.\n\n`;

    if (incidencesList.length > 0) {
        text += `--------------------------------------------------\n`;
        text += `RESUMEN DE ACLARACIONES (${incidencesList.length} Casos):\n`;
        let totalClaimed = incidencesList.reduce((acc, c) => acc + (parseFloat(c.diffAmount)||0), 0);
        let totalJustified = incidencesList.reduce((acc, c) => c.isJustified ? acc + (parseFloat(c.diffAmount)||0) : acc, 0);
        text += `- Total Reclamado: $${totalClaimed.toLocaleString()} MXN\n`;
        text += `- Total Justificado: $${totalJustified.toLocaleString()} MXN\n`;
        text += `- Diferencia: $${(totalClaimed - totalJustified).toLocaleString()} MXN\n`;
    }

    setDictumData(prev => ({ ...prev, conclusiones: text }));
  };

  // 2. LOGICA DE VALIDACIÓN (Igual que antes)
  useEffect(() => {
    if (!manualData.date && !manualData.diffAmount && !manualData.collectAmount) {
        setValidationResult(null); return;
    }
    runCrossValidation();
  }, [manualData]);

  const runCrossValidation = () => {
    const targetDate = manualData.date ? new Date(manualData.date) : null;
    const diffVal = parseFloat(manualData.diffAmount) || 0;
    const collectVal = parseFloat(manualData.collectAmount) || 0;
    let findings = [];
    let isJustified = false;
    let shortConclusion = "";

    if (diffVal > 0) {
        const unverifiedMatch = unverifiedLogs.find(l => Math.abs(l.amount - diffVal) < 2);
        if (unverifiedMatch) {
            isJustified = true;
            findings.push(`✅ DIFERENCIA JUSTIFICADA: Coincide con depósito "UNVERIFIED" del ${unverifiedMatch.timestamp}.`);
            shortConclusion = "Coincide con Unverified";
        } else {
             if (targetDate) {
                 const errorMatch = processedLogs.find(l => {
                     const lDate = new Date(l.timestamp);
                     return Math.abs(lDate - targetDate) < 3600000;
                 });
                 if (errorMatch) {
                     isJustified = true;
                     findings.push(`⚠️ JUSTIFICADO POR ERROR TÉCNICO: Falla "${errorMatch.name}" registrada a la hora del incidente.`);
                     shortConclusion = `Falla técnica (${errorMatch.name})`;
                 } else {
                     findings.push(`❌ SIN EVIDENCIA TÉCNICA: No hay errores ni depósitos en esa fecha.`);
                     shortConclusion = "Sin evidencia en logs";
                 }
             }
        }
    } else if (collectVal > 0) {
         const collectMatch = collectLogs.find(l => Math.abs(l.amount - collectVal) < 1);
         if(collectMatch) {
             findings.push(`✅ RECOLECCIÓN ENCONTRADA: ${collectMatch.timestamp}`);
             isJustified = true;
             shortConclusion = "Recolección Conciliada";
         } else {
             findings.push(`⚠️ RECOLECCIÓN NO ENCONTRADA`);
             shortConclusion = "Faltante de Recolección";
         }
    }
    setValidationResult({ isJustified, findings, conclusionText: findings.join('\n'), shortConclusion: shortConclusion || "Pendiente" });
  };

  const handleAddToList = () => {
    if (!manualData.folio && !manualData.diffAmount) { alert("Ingresa Folio y Monto."); return; }
    const newIncidence = {
        id: Date.now(),
        folio: manualData.folio || 'S/N',
        diffAmount: manualData.diffAmount || 0,
        date: manualData.date,
        isJustified: validationResult?.isJustified || false,
        conclusionText: validationResult?.conclusionText || "Sin análisis",
        shortConclusion: validationResult?.shortConclusion || "N/A",
    };
    setIncidencesList([...incidencesList, newIncidence]);
    setManualData({ folio: '', diffAmount: '', collectAmount: '', date: '', hasPdf: false, rawText: '' });
    setValidationResult(null);
  };

  const handleRemoveFromList = (id) => setIncidencesList(incidencesList.filter(item => item.id !== id));

  const handleIncidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsReadingPdf(true);
    try {
      const pdfData = await parseIncidencePDF(file);
      let bestDate = '';
      if (pdfData.targetTimestamps.length > 0) {
          const d = pdfData.targetTimestamps[0].dateObj;
          const offset = d.getTimezoneOffset() * 60000;
          bestDate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      }
      const moneyMatch = pdfData.debugText.match(/\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      const extractedAmount = moneyMatch ? moneyMatch[1].replace(/,/g, '') : '';
      setManualData({
          folio: pdfData.folio !== 'S/N' ? pdfData.folio : '',
          diffAmount: extractedAmount,
          collectAmount: '',
          date: bestDate,
          hasPdf: true,
          rawText: pdfData.debugText
      });
    } catch (error) {
      alert(`Error lectura: ${error.message}`);
    } finally {
      setIsReadingPdf(false);
      e.target.value = null;
    }
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('printable-report-content');
    const fileName = `Dictamen_${dictumData.etv || 'General'}.pdf`;
    const opt = { margin: [0.5, 0.5], filename: fileName, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(element).save().then(() => setIsGenerating(false));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-xl print:shadow-none print:p-0">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clipboard className="text-blue-600" /> Dictamen Final
        </h2>
        <button onClick={handleDownloadPDF} disabled={isGenerating} className={`bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 ${isGenerating ? 'opacity-50' : ''}`}>
          <Download size={18} /> {isGenerating ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      <div className="print:hidden">
        {/* INFO CLIENTE */}
        <div className="mb-6 border-b-2 border-slate-800 pb-4">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <input type="text" placeholder="Cliente..." className="bg-transparent border-b outline-none" value={dictumData.cliente} onChange={(e) => setDictumData({ ...dictumData, cliente: e.target.value })} />
                <input type="text" placeholder="ETV / Sucursal..." className="bg-transparent border-b outline-none" value={dictumData.etv} onChange={(e) => setDictumData({ ...dictumData, etv: e.target.value })} />
                <input type="text" placeholder="Serie..." className="bg-transparent border-b outline-none" value={dictumData.serie} onChange={(e) => setDictumData({ ...dictumData, serie: e.target.value })} />
                <input type="text" placeholder="Dirección..." className="bg-transparent border-b outline-none" value={dictumData.direccion} onChange={(e) => setDictumData({ ...dictumData, direccion: e.target.value })} />
                <input type="text" placeholder="Técnico..." className="bg-transparent border-b outline-none" value={dictumData.tecnico} onChange={(e) => setDictumData({ ...dictumData, tecnico: e.target.value })} />
            </div>
        </div>

        {/* --- INCIDENCIAS (CARRITO) --- */}
        <div className="mb-6 bg-blue-50 p-5 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-md font-bold text-blue-800 flex items-center gap-2"><FileText size={18} /> Aclaraciones / Faltantes</h3>
             <label className="cursor-pointer bg-white text-blue-600 px-3 py-1 rounded border border-blue-300 text-xs font-bold hover:bg-blue-50">
                Importar PDF <input type="file" accept=".pdf" className="hidden" onChange={handleIncidenceUpload} />
             </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
             <div><label className="text-[10px] font-bold text-slate-500 uppercase">Folio</label><input type="text" className="w-full p-2 border rounded bg-white text-sm font-bold" value={manualData.folio} onChange={(e) => setManualData({...manualData, folio: e.target.value})} placeholder="Ej: 19325..." /></div>
             <div><label className="text-[10px] font-bold text-slate-500 uppercase">Faltante ($)</label><input type="number" className="w-full p-2 border rounded bg-white text-sm font-bold text-red-600" value={manualData.diffAmount} onChange={(e) => setManualData({...manualData, diffAmount: e.target.value})} placeholder="0.00" /></div>
             <div><label className="text-[10px] font-bold text-slate-500 uppercase">Fecha</label><input type="datetime-local" className="w-full p-2 border rounded bg-white text-sm" value={manualData.date} onChange={(e) => setManualData({...manualData, date: e.target.value})} /></div>
             <div className="flex items-end"><button onClick={handleAddToList} className="w-full bg-blue-600 text-white p-2 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50" disabled={!manualData.folio && !manualData.diffAmount}><Plus size={16} className="inline"/> Agregar</button></div>
          </div>
          {validationResult && <div className={`mb-4 p-2 rounded text-xs border ${validationResult.isJustified ? 'bg-green-100 border-green-300' : 'bg-white border-slate-200'} text-center italic`}>{validationResult.conclusionText}</div>}
          
          {incidencesList.length > 0 && (
            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-600 uppercase"><tr><th className="p-2">Folio</th><th className="p-2">Fecha</th><th className="p-2 text-right">Monto</th><th className="p-2 text-center">Estado</th><th className="p-2 text-center">Acción</th></tr></thead>
                    <tbody>
                        {incidencesList.map((inc) => (
                            <tr key={inc.id} className="border-t hover:bg-slate-50">
                                <td className="p-2 font-mono">{inc.folio}</td>
                                <td className="p-2">{inc.date ? new Date(inc.date).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-2 text-right font-bold">${parseFloat(inc.diffAmount).toLocaleString()}</td>
                                <td className="p-2 text-center">{inc.isJustified ? <span className="text-green-700 font-bold">Justificado</span> : <span className="text-red-700 font-bold">No Procede</span>}</td>
                                <td className="p-2 text-center"><button onClick={() => handleRemoveFromList(inc.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>

        {/* --- NUEVA SECCIÓN: MANTENIMIENTO REQUERIDO --- */}
        <div className="mb-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
           <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Wrench size={18} /> Plan de Mantenimiento y Refacciones Sugeridas
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Checkbox Cambio Rodillos */}
              <div className={`p-4 rounded border cursor-pointer transition-all ${maintenance.requiresRollers ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300' : 'bg-white border-slate-300 hover:border-orange-200'}`}
                   onClick={() => setMaintenance(prev => ({...prev, requiresRollers: !prev.requiresRollers}))}>
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded border flex items-center justify-center ${maintenance.requiresRollers ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-400'}`}>
                        {maintenance.requiresRollers && <CheckCircle size={14}/>}
                     </div>
                     <div>
                        <p className="font-bold text-sm text-slate-700">Cambio de Kit de Rodillos</p>
                        <p className="text-xs text-slate-500">Por desgaste de consumibles o errores de alimentación (Jams).</p>
                     </div>
                  </div>
              </div>

              {/* Checkbox Servicios Adicionales */}
              <div className={`p-4 rounded border cursor-pointer transition-all ${maintenance.requiresServices ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-300 hover:border-blue-200'}`}
                   onClick={() => setMaintenance(prev => ({...prev, requiresServices: !prev.requiresServices}))}>
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded border flex items-center justify-center ${maintenance.requiresServices ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400'}`}>
                        {maintenance.requiresServices && <CheckCircle size={14}/>}
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-sm text-slate-700">Servicios Preventivos Adicionales</p>
                        <p className="text-xs text-slate-500">Justificado por alta carga de trabajo.</p>
                     </div>
                     {/* Input numérico solo si está activo */}
                     {maintenance.requiresServices && (
                        <div className="flex items-center gap-1 bg-white p-1 rounded border border-blue-200" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-bold text-slate-500">Cant:</span>
                            <input 
                                type="number" 
                                min="1" max="10"
                                className="w-10 text-center font-bold text-blue-700 outline-none"
                                value={maintenance.serviceCount}
                                onChange={(e) => setMaintenance(prev => ({...prev, serviceCount: e.target.value}))}
                            />
                        </div>
                     )}
                  </div>
              </div>
           </div>
           
           <div className="mt-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Justificación Técnica (Aparecerá en reporte)</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded bg-white text-xs text-slate-700"
                value={maintenance.reason}
                onChange={(e) => setMaintenance(prev => ({...prev, reason: e.target.value}))}
              />
           </div>
        </div>

        {/* EDITOR CONCLUSIONES */}
        <div className="mb-8">
          <h3 className="text-lg font-bold bg-slate-100 p-2 border-l-4 border-blue-600 mb-2">1. Conclusiones y Diagnóstico</h3>
          <textarea className="w-full h-32 p-3 border border-slate-200 rounded text-justify leading-relaxed focus:border-blue-500 outline-none resize-none text-sm" value={dictumData.conclusiones} onChange={(e) => setDictumData({ ...dictumData, conclusiones: e.target.value })} />
        </div>
        
      </div>

      {/* REPORTE IMPRIMIBLE */}
      <PrintableReport
        dictumData={dictumData}
        stats={stats}
        amounts={amounts}
        successPercentage={successPercentage}
        topErrorsData={topErrorsData}
        unverifiedLogs={unverifiedLogs}
        incidencesList={incidencesList} 
        maintenance={maintenance} // <--- Pasamos los datos de mantenimiento
      />
    </div>
  );
}