import React from 'react';
import { X, Calendar, User, Clock, Wrench, FileText, Image, Download, CheckCircle2 } from 'lucide-react';

export default function ServiceDetailModal({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Contenedor tipo "Papel Digital" */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex justify-between items-start">
          <div>
             <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                    service.type === 'Correctivo' ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                }`}>
                    {service.type}
                </span>
                <span className="text-slate-500 text-sm font-mono">Folio #{service.id}</span>
             </div>
             <h2 className="text-xl font-bold text-white">Reporte de Servicio</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Grid de Info Clave */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 uppercase font-bold"><Calendar size={12}/> Fecha</div>
               <div className="text-white font-mono">{service.date}</div>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 uppercase font-bold"><User size={12}/> Técnico</div>
               <div className="text-white truncate">{service.tech}</div>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 uppercase font-bold"><Clock size={12}/> Duración</div>
               <div className="text-white">{service.duration} hrs</div>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 uppercase font-bold"><CheckCircle2 size={12}/> Estatus</div>
               <div className="text-emerald-400">{service.status}</div>
            </div>
          </div>

          {/* Descripción Técnica */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                <FileText size={16}/> Diagnóstico y Actividades
            </h3>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
                {service.description || service.notes || "Sin descripción detallada registrada."}
            </div>
          </div>

          {/* Refacciones */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                <Wrench size={16}/> Refacciones Utilizadas
            </h3>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg"><Wrench size={18} className="text-slate-400"/></div>
                <span className="text-slate-300 text-sm">{service.parts || "No se utilizaron refacciones."}</span>
            </div>
          </div>

          {/* Archivos Adjuntos (Hoja de Servicio / Evidencia) */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
                <Image size={16}/> Evidencia Digital y Documentos
            </h3>
            
            {service.files && service.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg ${file.type === 'pdf' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {file.type === 'pdf' ? <FileText size={20}/> : <Image size={20}/>}
                                </div>
                                <span className="text-sm text-slate-200 truncate">{file.name}</span>
                            </div>
                            <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                                <Download size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
                    No hay archivos adjuntos a este reporte.
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
}