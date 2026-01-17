import React, { useState, useEffect } from 'react';
import { Clipboard, Download, FileText, CheckCircle, Trash2, Plus, Wrench, Activity, DollarSign, AlertTriangle, Terminal, XCircle, Calendar, Hash } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import PrintableReport from './PrintableReport.jsx';
import { parseIncidencePDF } from '../../utils/incidenceParser';

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
  // ----------------------------------------------------------------------
  // 1. ESTADO Y LÓGICA ORIGINAL
  // ----------------------------------------------------------------------

  const [dictumData, setDictumData] = useState({
    cliente: '', equipo: 'DE-100', serie: '', etv: '', direccion: '', tecnico: '', conclusiones: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estado para mantenimiento
  const [maintenance, setMaintenance] = useState({
    requiresRollers: false, requiresServices: false, serviceCount: 2, reason: 'Alta Carga de Trabajo y Desgaste Operativo'
  });

  const [incidencesList, setIncidencesList] = useState([]);

  // Formulario manual (RECUPERADO CAMPO FECHA)
  const [manualData, setManualData] = useState({
    folio: '', diffAmount: '', collectAmount: '', date: '', hasPdf: false, rawText: ''
  });

  const [validationResult, setValidationResult] = useState(null);

  // --- GENERACIÓN DE TEXTO ---
  useEffect(() => {
    generateConclusions();
  }, [processedLogs, unverifiedLogs, collectLogs, depositLogs, incidencesList]); 

  const generateConclusions = () => {
    if (processedLogs.length === 0 && unverifiedLogs.length === 0 && collectLogs.length === 0 && incidencesList.length === 0) return;

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

  // --- VALIDACIÓN CRUZADA (LÓGICA ORIGINAL) ---
  useEffect(() => {
    // Solo validamos si hay fecha O monto (cualquiera de los dos sirve para buscar pistas)
    if (!manualData.date && !manualData.diffAmount) {
        setValidationResult(null); return;
    }
    runCrossValidation();
  }, [manualData]);

  const runCrossValidation = () => {
    const targetDate = manualData.date ? new Date(manualData.date) : null;
    const diffVal = parseFloat(manualData.diffAmount) || 0;
    
    let findings = [];
    let isJustified = false;
    let shortConclusion = "";

    // 1. Buscar por MONTO en UNVERIFIED (Prioridad Alta)
    if (diffVal > 0) {
        const unverifiedMatch = unverifiedLogs.find(l => Math.abs(l.amount - diffVal) < 2); // Tolerancia $2
        if (unverifiedMatch) {
            isJustified = true;
            findings.push(`✅ DIFERENCIA JUSTIFICADA: Coincide con depósito "UNVERIFIED" de $${unverifiedMatch.amount} el ${unverifiedMatch.timestamp}.`);
            shortConclusion = "Coincide con Unverified";
        }
    }

    // 2. Si no se justificó por monto, intentar justificar por FECHA (Error Técnico)
    if (!isJustified && targetDate) {
         // Buscamos errores +/- 1 hora de la fecha reportada
         const errorMatch = processedLogs.find(l => {
             const lDate = new Date(l.timestamp);
             return Math.abs(lDate - targetDate) < 3600000; // 1 hora ventana
         });

         if (errorMatch) {
             isJustified = true;
             findings.push(`⚠️ JUSTIFICADO POR ERROR TÉCNICO: Falla "${errorMatch.name}" registrada cercana a la hora del incidente.`);
             shortConclusion = `Falla técnica (${errorMatch.name})`;
         } else {
             // Si tampoco hay error, buscamos si hubo actividad (depósitos) cerca de esa hora aunque el monto no coincida
             const activityMatch = depositLogs.find(l => {
                const lDate = new Date(l.timestamp);
                return Math.abs(lDate - targetDate) < 1800000; // 30 min ventana
             });
             
             if (activityMatch) {
                findings.push(`ℹ️ ACTIVIDAD ENCONTRADA: Hubo depósitos exitosos cerca de esta hora (${activityMatch.timestamp}), pero el monto no coincide.`);
                shortConclusion = "Actividad sin coincidencia de monto";
             } else {
                findings.push(`❌ SIN EVIDENCIA: No hay errores ni actividad registrada en la fecha/hora indicada.`);
                shortConclusion = "Sin evidencia en logs";
             }
         }
    } else if (!isJustified && !targetDate && diffVal > 0) {
        findings.push(`❌ SIN EVIDENCIA: El monto no está en "Unverified". (Intenta agregar la Fecha exacta para buscar errores técnicos).`);
        shortConclusion = "No encontrado por Monto";
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
    // Limpiamos form pero mantenemos fecha por comodidad
    setManualData({ ...manualData, folio: '', diffAmount: '', hasPdf: false, rawText: '' });
    setValidationResult(null);
  };

  const handleRemoveFromList = (id) => setIncidencesList(incidencesList.filter(item => item.id !== id));

  const handleIncidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
      e.target.value = null;
    }
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('printable-report-content');
    const fileName = `Dictamen_${dictumData.etv || 'General'}.pdf`;
    const opt = { 
        margin: [0.3, 0.3], 
        filename: fileName, 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2, useCORS: true, logging: false }, 
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save().then(() => setIsGenerating(false));
  };

  // ----------------------------------------------------------------------
  // 2. RENDERIZADO
  // ----------------------------------------------------------------------

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur opacity-20 pointer-events-none"></div>

        <div className="relative z-10">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                    <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                        <Clipboard className="text-cyan-400" size={24} />
                    </div>
                    Dictamen Final
                </h2>
                <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGenerating} 
                    className={`
                        relative overflow-hidden rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all
                        ${isGenerating ? 'bg-slate-800 opacity-50' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-500/20 hover:scale-[1.02]'}
                    `}
                >
                    <span className="flex items-center gap-2">
                        <Download size={18} /> {isGenerating ? 'Generando PDF...' : 'Descargar Reporte'}
                    </span>
                </button>
            </div>

            <div className="print:hidden space-y-6">
                
                {/* 1. MONITOR DE DICTAMEN */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-2xl">
                        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                             <Terminal size={14} className="text-emerald-400"/>
                             <span className="text-xs font-mono text-slate-400">output_log_analysis.txt (Editable)</span>
                        </div>
                        <textarea 
                            className="flex-1 w-full bg-transparent p-4 text-xs md:text-sm font-mono text-emerald-500/90 focus:outline-none resize-none leading-relaxed custom-scrollbar"
                            value={dictumData.conclusiones}
                            onChange={(e) => setDictumData({ ...dictumData, conclusiones: e.target.value })}
                            spellCheck="false"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><DollarSign size={14} className="text-cyan-400"/> Balance</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Ingresado</span><span className="text-white font-mono font-bold">${amounts.deposited.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Riesgo</span><span className="text-rose-400 font-mono font-bold">${amounts.unverified.toLocaleString()}</span></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Activity size={14} className="text-orange-400"/> Estatus Técnico</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Errores</span><span className={`font-mono font-bold ${stats.totalErrors > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>{stats.totalErrors} Eventos</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Fiabilidad</span><span className="text-white font-mono font-bold">{successPercentage}%</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-800 w-full"></div>
                
                {/* 2. DATOS CLIENTE */}
                <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-2"><FileText size={16}/> Datos del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {['Cliente', 'ETV', 'Serie', 'Direccion', 'Tecnico'].map((field) => (
                            <div key={field} className="group/input relative">
                                <input type="text" placeholder=" " className="peer w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 pt-4 pb-2 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" value={dictumData[field.toLowerCase()]} onChange={(e) => setDictumData({ ...dictumData, [field.toLowerCase()]: e.target.value })} />
                                <label className="absolute left-4 top-1 text-[10px] text-slate-500 font-bold uppercase transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-600 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-cyan-500 pointer-events-none">{field}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* 3. INCIDENCIAS (CAPTURA COMPLETA RESTAURADA) */}
                    <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800/50 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                                <AlertTriangle size={16} className="text-rose-400" /> Aclaraciones
                            </h3>
                            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 border border-slate-700">
                                + PDF <input type="file" accept=".pdf" className="hidden" onChange={handleIncidenceUpload} />
                            </label>
                        </div>

                        {/* FORMULARIO EXPANDIDO (Grid 3 columnas + Botón abajo) */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-4">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {/* Folio */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Hash size={10}/> Folio</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-cyan-500 outline-none" 
                                        value={manualData.folio} 
                                        onChange={(e) => setManualData({...manualData, folio: e.target.value})} 
                                        placeholder="Ej: 19321" 
                                    />
                                </div>
                                {/* Monto */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><DollarSign size={10}/> Monto Faltante</label>
                                    <input 
                                        type="number" 
                                        className={`w-full bg-slate-900 border rounded p-2 text-xs font-bold outline-none transition-colors
                                            ${validationResult?.isJustified ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-rose-400'}`}
                                        value={manualData.diffAmount} 
                                        onChange={(e) => setManualData({...manualData, diffAmount: e.target.value})} 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                            
                            {/* Fecha (Restaurada) */}
                            <div className="mb-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Calendar size={10}/> Fecha del Incidente</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300 [color-scheme:dark] focus:border-cyan-500 outline-none" 
                                    value={manualData.date} 
                                    onChange={(e) => setManualData({...manualData, date: e.target.value})} 
                                />
                                <p className="text-[10px] text-slate-600 mt-1 italic">Ingresa la fecha para buscar fallas técnicas si el monto no coincide.</p>
                            </div>

                            <button onClick={handleAddToList} className="w-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded p-2 text-xs font-bold hover:bg-cyan-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Plus size={14}/> Agregar Aclaración
                            </button>
                        </div>

                        {/* RESULTADO DE VALIDACIÓN (FEEDBACK VISUAL) */}
                        {validationResult && (
                            <div className={`mb-4 p-3 rounded text-xs font-mono border flex items-start gap-2 animate-in fade-in slide-in-from-top-1
                                ${validationResult.isJustified 
                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                                    : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                                }`
                            }>
                                <div className="mt-0.5">{validationResult.isJustified ? <CheckCircle size={14}/> : <XCircle size={14}/>}</div>
                                <div>
                                    <p className="font-bold">{validationResult.shortConclusion}</p>
                                    <p className="opacity-70 text-[10px] mt-1 whitespace-pre-line">{validationResult.conclusionText}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* LISTA DE ITEMS */}
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {incidencesList.map((inc) => (
                                <div key={inc.id} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-300 font-mono font-bold">#{inc.folio}</span>
                                            <span className="text-[10px] text-slate-500">| {inc.date ? new Date(inc.date).toLocaleDateString() : 'Sin Fecha'}</span>
                                        </div>
                                        <p className={`text-[10px] font-bold ${inc.isJustified ? 'text-emerald-500' : 'text-rose-500'}`}>{inc.isJustified ? 'JUSTIFICADO' : 'NO PROCEDE'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-200">${parseFloat(inc.diffAmount).toLocaleString()}</span>
                                        <button onClick={() => handleRemoveFromList(inc.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={12}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. MANTENIMIENTO */}
                    <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800/50">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <Wrench size={16} className="text-indigo-400" /> Plan Técnico
                        </h3>
                        <div className="space-y-3">
                            <div onClick={() => setMaintenance(prev => ({...prev, requiresRollers: !prev.requiresRollers}))}
                                className={`p-3 rounded border cursor-pointer flex items-center gap-3 transition-all ${maintenance.requiresRollers ? 'bg-orange-500/10 border-orange-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                <div className={`w-4 h-4 rounded flex items-center justify-center ${maintenance.requiresRollers ? 'bg-orange-500 text-white' : 'border border-slate-600'}`}>
                                    {maintenance.requiresRollers && <CheckCircle size={10}/>}
                                </div>
                                <span className="text-xs font-bold text-slate-300">Cambio de Rodillos (Kit)</span>
                            </div>
                            
                            <div onClick={() => setMaintenance(prev => ({...prev, requiresServices: !prev.requiresServices}))}
                                className={`p-3 rounded border cursor-pointer flex items-center gap-3 transition-all ${maintenance.requiresServices ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                <div className={`w-4 h-4 rounded flex items-center justify-center ${maintenance.requiresServices ? 'bg-cyan-500 text-white' : 'border border-slate-600'}`}>
                                    {maintenance.requiresServices && <CheckCircle size={10}/>}
                                </div>
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-300">Servicios Adicionales</span>
                                    {maintenance.requiresServices && (
                                        <input type="number" className="w-8 text-center bg-slate-900 border border-cyan-500/50 rounded text-xs text-cyan-400" value={maintenance.serviceCount} onChange={(e) => setMaintenance(prev => ({...prev, serviceCount: e.target.value}))} onClick={(e) => e.stopPropagation()}/>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* REPORTE OCULTO */}
            <div className="hidden">
                <div id="printable-report-content">
                    <PrintableReport
                        dictumData={dictumData}
                        stats={stats}
                        amounts={amounts}
                        successPercentage={successPercentage}
                        topErrorsData={topErrorsData}
                        unverifiedLogs={unverifiedLogs}
                        incidencesList={incidencesList} 
                        maintenance={maintenance} 
                    />
                </div>
            </div>
        </div>
    </div>
  );
}