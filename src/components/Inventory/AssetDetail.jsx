import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Wrench, Activity, FileText, MapPin, Hash, Plus, Edit3, Trash2, X, Save, Box, Eye, UploadCloud } from 'lucide-react';

// IMPORTAMOS EL NUEVO COMPONENTE
import ServiceDetailModal from './ServiceDetailModal.jsx';

export default function AssetDetail({ asset, onBack, onAddService, onUpdateAsset }) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // ESTADO PARA EL SERVICIO SELECCIONADO (VISOR)
  const [selectedServiceView, setSelectedServiceView] = useState(null);

  // --- CÁLCULOS DE KPIs ---
  const totalServices = asset.history.length;
  const correctiveCount = asset.history.filter(h => h.type === 'Correctivo').length;
  const totalHours = asset.history.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  
  const installDate = new Date(asset.installDate);
  const today = new Date();
  const daysActive = Math.floor((today - installDate) / (1000 * 60 * 60 * 24));
  const mtbf = correctiveCount > 0 ? Math.floor(daysActive / correctiveCount) : daysActive;
  const healthScore = Math.max(0, 100 - (correctiveCount * 10));

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 relative">
      
      {/* HEADER Y NAVEGACIÓN (Igual que antes) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <ArrowLeft size={20} />
            </button>
            <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {asset.model} <span className="text-slate-500">|</span> {asset.serial}
                <span className={`text-xs px-2 py-0.5 rounded border ml-2 ${asset.status === 'active' ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/50 border-rose-500/50 text-rose-400'}`}>
                    {asset.status === 'active' ? 'ACTIVO' : 'BAJA / MANT'}
                </span>
            </h2>
            <p className="text-cyan-400 text-sm flex items-center gap-2">
               <MapPin size={14} /> {asset.client} - {asset.branch} ({asset.location})
            </p>
            </div>
        </div>

        <div className="flex gap-2">
            <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors">
                <Edit3 size={16} /> Editar Ficha
            </button>
            <button onClick={() => setShowServiceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-cyan-900/20">
                <Plus size={18} /> Registrar Servicio
            </button>
        </div>
      </div>

      {/* KPIs (Igual que antes) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Salud */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={48} className="text-white" /></div>
          <p className="text-slate-400 text-xs uppercase font-bold">Health Score</p>
          <div className="flex items-end gap-2"><span className={`text-3xl font-bold ${healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{healthScore}%</span></div>
          <div className="w-full h-1 bg-slate-800 mt-2 rounded-full"><div className={`h-full rounded-full ${healthScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${healthScore}%` }}></div></div>
        </div>
        {/* Horas */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-start"><div><p className="text-slate-400 text-xs uppercase font-bold">Tiempo Invertido</p><p className="text-2xl font-bold text-white mt-1">{totalHours} <span className="text-sm font-normal text-slate-500">hrs</span></p></div><div className="p-2 bg-slate-800 rounded-lg text-cyan-400"><Clock size={18} /></div></div>
        </div>
        {/* MTBF */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-start"><div><p className="text-slate-400 text-xs uppercase font-bold">MTBF</p><p className="text-2xl font-bold text-white mt-1">{mtbf} <span className="text-sm font-normal text-slate-500">días</span></p></div><div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Activity size={18} /></div></div>
        </div>
        {/* Servicios */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-start"><div><p className="text-slate-400 text-xs uppercase font-bold">Servicios</p><p className="text-2xl font-bold text-white mt-1">{totalServices}</p></div><div className="p-2 bg-slate-800 rounded-lg text-purple-400"><Wrench size={18} /></div></div>
        </div>
      </div>

      {/* TABLA HISTORIAL ACTUALIZADA (Ahora con botón de Ver) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800 h-fit">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-cyan-400"/> Datos del Equipo</h3>
            <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Modelo</span><span className="text-white font-medium">{asset.model}</span></div>
                <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Serie</span><span className="text-white font-medium font-mono">{asset.serial}</span></div>
                <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Póliza</span><span className="text-white font-medium">{asset.contract.type}</span></div>
                <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">ETV</span><span className="text-white font-medium">{asset.etv}</span></div>
                <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Instalación</span><span className="text-white font-medium">{asset.installDate}</span></div>
            </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-cyan-400"/> Historial de Servicio
            </h3>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 text-slate-200 uppercase text-xs sticky top-0 backdrop-blur-md">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Técnico</th>
                            <th className="px-4 py-3">Resumen</th>
                            <th className="px-4 py-3 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {asset.history.map((record) => (
                            <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-4 py-3 font-mono text-cyan-500">{record.date}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${record.type === 'Correctivo' ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'}`}>
                                        {record.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-white">{record.tech}</td>
                                <td className="px-4 py-3 truncate max-w-[150px]">{record.notes}</td>
                                <td className="px-4 py-3 text-center">
                                    <button 
                                        onClick={() => setSelectedServiceView(record)} // <--- ABRIR MODAL
                                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all"
                                        title="Ver Hoja de Servicio"
                                    >
                                        <Eye size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* 1. Visor de Hoja de Servicio */}
      <ServiceDetailModal 
        service={selectedServiceView}
        onClose={() => setSelectedServiceView(null)}
      />

      {/* 2. Modal Nuevo Servicio (Actualizado con Upload sim) */}
      {showServiceModal && (
        <ServiceModal 
            onClose={() => setShowServiceModal(false)}
            onSubmit={(data) => {
                onAddService(asset.id, data);
                setShowServiceModal(false);
            }}
        />
      )}

      {/* 3. Modal Editar */}
      {showEditModal && (
        <EditAssetModal 
            asset={asset}
            onClose={() => setShowEditModal(false)}
            onSave={(updatedData) => {
                onUpdateAsset(updatedData);
                setShowEditModal(false);
            }}
        />
      )}

    </div>
  );
}

// --- SUB-COMPONENTE: MODAL DE NUEVO SERVICIO ---
function ServiceModal({ onClose, onSubmit }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Simulamos la carga del archivo
        const fileInput = e.target.querySelector('input[type="file"]');
        const simulatedFiles = [];
        if (fileInput.files.length > 0) {
            simulatedFiles.push({
                name: fileInput.files[0].name,
                type: fileInput.files[0].name.endsWith('.pdf') ? 'pdf' : 'image'
            });
        }

        onSubmit({
            id: Date.now(),
            date: formData.get('date'),
            type: formData.get('type'),
            tech: formData.get('tech'),
            notes: formData.get('notes'), // Resumen corto
            description: formData.get('description'), // Descripción detallada nueva
            parts: formData.get('parts'),
            duration: Number(formData.get('duration')),
            status: 'Completado',
            files: simulatedFiles // Archivos simulados
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Registrar Servicio</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Fecha</label>
                            <input type="date" name="date" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Duración (Hrs)</label>
                            <input type="number" step="0.5" name="duration" defaultValue="1.0" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tipo</label>
                            <select name="type" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none">
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                                <option value="Instalación">Instalación</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Técnico</label>
                            <input type="text" name="tech" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Refacciones</label>
                        <input type="text" name="parts" placeholder="Ej: Rodillos, Sensor..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Resumen Corto</label>
                        <input type="text" name="notes" placeholder="Ej: Falla corregida en sensor" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Diagnóstico Detallado</label>
                        <textarea name="description" rows="3" placeholder="Describe detalladamente el trabajo realizado..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"></textarea>
                    </div>

                    {/* ZONA DE CARGA DE ARCHIVOS */}
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors">
                        <input type="file" id="file-upload" className="hidden" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <div className="p-2 bg-slate-800 rounded-full text-cyan-400">
                                <UploadCloud size={20} />
                            </div>
                            <span className="text-sm text-slate-300 font-medium">Adjuntar Hoja de Servicio / Fotos</span>
                            <span className="text-xs text-slate-500">(PDF, JPG, PNG)</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors mt-2 shadow-lg shadow-cyan-900/20">
                        Guardar Registro
                    </button>
                </form>
            </div>
        </div>
    );
}

// El modal de Editar Equipo se mantiene igual (omito aquí para no repetir código innecesario, pero debe estar presente si copias todo el archivo)
function EditAssetModal({ asset, onClose, onSave }) {
     const [status, setStatus] = useState(asset.status);
    // ... (Mismo código del modal editar que te di antes)
    // Si necesitas que lo repita completo dímelo, pero es idéntico al anterior.
    
    // --- REPITO EL MODAL EDITAR PARA QUE PUEDAS COPIAR Y PEGAR TODO EL ARCHIVO SIN ERRORES ---
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSave({
            ...asset,
            status: status,
            model: formData.get('model'),
            serial: formData.get('serial'),
            branch: formData.get('branch'),
            location: formData.get('location'),
            etv: formData.get('etv')
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Edit3 size={20}/> Editar Ficha Técnica</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
                        <h4 className="text-xs font-bold text-cyan-500 uppercase flex items-center gap-2"><Box size={12}/> Identificación del Equipo</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Modelo</label>
                                <select name="model" defaultValue={asset.model} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none">
                                    <option value="DE-100">DE-100</option>
                                    <option value="DE-50">DE-50</option>
                                    <option value="DN-200">DN-200</option>
                                    <option value="Glory-X">Glory-X</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">No. Serie</label>
                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-2">
                                    <Hash size={14} className="text-slate-500"/>
                                    <input type="text" name="serial" defaultValue={asset.serial} className="bg-transparent text-white outline-none w-full font-mono text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
                        <h4 className="text-xs font-bold text-cyan-500 uppercase flex items-center gap-2"><MapPin size={12}/> Ubicación y Logística</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Sucursal / Cliente</label>
                            <input type="text" name="branch" defaultValue={asset.branch} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Ubicación Interna (Detalle)</label>
                            <input type="text" name="location" defaultValue={asset.location} placeholder="Ej: Zona de cajas, Bóveda..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none" />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">ETV Asignada</label>
                            <select name="etv" defaultValue={asset.etv} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none">
                                <option value="Cometra">Cometra</option>
                                <option value="Sepsa">Sepsa</option>
                                <option value="Panamericano">Panamericano</option>
                                <option value="Tecnoval">Tecnoval</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Estado Operativo</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['active', 'maintenance', 'inactive'].map((s) => (
                                <button key={s} type="button" onClick={() => setStatus(s)} className={`py-2 text-xs font-bold rounded-lg border capitalize transition-all ${status === s ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>{s === 'inactive' ? 'Baja Definitiva' : s === 'maintenance' ? 'Mantenimiento' : 'Activo'}</button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        {status === 'inactive' && (<div className="flex-1 p-2 bg-rose-950/30 border border-rose-900 rounded text-rose-400 text-xs flex items-center justify-center gap-2"><Trash2 size={14} /> El equipo saldrá de operación</div>)}
                        <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-cyan-900/20"><Save size={18} /> Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
}