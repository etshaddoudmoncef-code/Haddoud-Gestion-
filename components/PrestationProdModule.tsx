import React, { useState, useMemo, useEffect } from 'react';
import { PrestationProdRecord, MasterData } from '../types.ts';

interface PrestationProdModuleProps {
  records: PrestationProdRecord[];
  masterData: MasterData;
  onAdd: (data: Omit<PrestationProdRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  onUpdate: (id: string, data: Partial<PrestationProdRecord>) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const PrestationProdModule: React.FC<PrestationProdModuleProps> = ({ records, masterData, onAdd, onUpdate, onDelete, isAdmin }) => {
  const [subTab, setSubTab] = useState<'stats' | 'entry' | 'journal'>('stats');
  const [editingRecord, setEditingRecord] = useState<PrestationProdRecord | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalWeight = monthlyRecords.reduce((sum, r) => sum + r.weightOut, 0);
    const totalAmount = monthlyRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalWaste = monthlyRecords.reduce((sum, r) => sum + r.wasteKg, 0);
    const totalEmployees = monthlyRecords.reduce((sum, r) => sum + (r.employeeCount || 0), 0);
    
    const uniqueDays = new Set(monthlyRecords.map(r => r.date)).size;

    return { 
      totalWeight, 
      totalAmount, 
      totalWaste, 
      count: monthlyRecords.length,
      avgEmployees: uniqueDays > 0 ? totalEmployees / uniqueDays : 0,
      avgYield: totalEmployees > 0 ? totalWeight / totalEmployees : 0,
      avgDailyWeight: uniqueDays > 0 ? totalWeight / uniqueDays : 0
    };
  }, [records]);

  const handleStartEdit = (record: PrestationProdRecord) => {
    setEditingRecord(record);
    setSubTab('entry');
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer définitivement cette prestation ?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-6">
        {['stats', 'entry', 'journal'].map((t) => (
          <button 
            key={t}
            onClick={() => {
              setSubTab(t as any);
              if (t !== 'entry') setEditingRecord(null);
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${subTab === t ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t === 'stats' ? 'Résumé' : t === 'entry' ? 'Saisie' : 'Journal'}
          </button>
        ))}
      </div>

      {subTab === 'stats' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-3xl shadow-lg text-white">
              <p className="text-[10px] font-black uppercase mb-1 opacity-70">Volume mensuel total</p>
              <p className="text-3xl font-black">{stats.totalWeight.toLocaleString()} <span className="text-sm font-normal opacity-60">kg</span></p>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                <div>
                  <p className="text-[9px] opacity-60 uppercase font-black">Rendement Jour</p>
                  <p className="text-lg font-bold">{stats.avgDailyWeight.toFixed(0)} <span className="text-[10px] font-normal">kg/j</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] opacity-60 uppercase font-black">Chiffre d'Affaire</p>
                  <p className="text-lg font-bold">{stats.totalAmount.toLocaleString()} <span className="text-[10px] font-normal">DA</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Moy. Employés/J</p>
                <p className="text-xl font-black text-purple-600">{stats.avgEmployees.toFixed(1)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Kg / Employé</p>
                <p className="text-xl font-black text-slate-800">{stats.avgYield.toFixed(1)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Pertes</p>
                <p className="text-xl font-black text-red-500">{stats.totalWaste.toLocaleString()} <span className="text-[10px]">kg</span></p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Lots</p>
                <p className="text-xl font-black text-slate-800">{stats.count}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'entry' && (
        <PrestationProdForm 
          onSubmit={(d: any) => {
            if (editingRecord) {
              onUpdate(editingRecord.id, d);
              setEditingRecord(null);
              setSubTab('journal');
            } else {
              onAdd(d);
            }
          }} 
          masterData={masterData} 
          initialData={editingRecord || undefined}
        />
      )}

      {subTab === 'journal' && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {records.length === 0 ? <p className="text-center py-10 text-slate-400 italic text-xs">Aucun enregistrement trouvé.</p> : 
            records.sort((a,b) => b.timestamp - a.timestamp).map(r => (
              <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">{r.clientName} <span className="text-[8px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded uppercase ml-1">{r.serviceType}</span></p>
                  <p className="text-[9px] text-slate-400">{new Date(r.date).toLocaleDateString()} • {r.employeeCount || 0} emp.</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] text-slate-500">Net : <b>{r.weightOut}kg</b></span>
                    <span className="text-[9px] text-red-400">Pertes : <b>{r.wasteKg}kg</b></span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4 ml-4">
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{r.weightOut}kg</p>
                      {r.totalAmount > 0 && <p className="text-[10px] font-bold text-purple-600 whitespace-nowrap">{r.totalAmount.toLocaleString('fr-FR')} DA</p>}
                   </div>
                   <div className="flex items-center gap-1">
                     {isAdmin && (
                       <button onClick={() => handleStartEdit(r)} className="text-slate-300 hover:text-amber-500 p-1">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                       </button>
                     )}
                     <button onClick={() => handleDeleteClick(r.id)} className="text-slate-200 hover:text-red-500 p-1">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                     </button>
                   </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

const PrestationProdForm = ({ onSubmit, masterData, initialData }: { onSubmit: any, masterData: MasterData, initialData?: PrestationProdRecord }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: 'N/A',
    clientName: masterData.clients[0] || '',
    serviceType: masterData.serviceTypes[0] || 'Triage',
    weightIn: 0,
    weightOut: 0,
    wasteKg: 0,
    unitPrice: 0,
    totalAmount: 0,
    employeeCount: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        lotNumber: initialData.lotNumber,
        clientName: initialData.clientName,
        serviceType: initialData.serviceType,
        weightIn: initialData.weightIn,
        weightOut: initialData.weightOut,
        wasteKg: initialData.wasteKg,
        unitPrice: initialData.unitPrice,
        totalAmount: initialData.totalAmount,
        employeeCount: initialData.employeeCount || 0
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData(prev => ({ 
        ...prev, 
        weightIn: 0, 
        weightOut: 0, 
        wasteKg: 0, 
        totalAmount: 0,
        employeeCount: 0
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-3xl shadow-sm border animate-in fade-in duration-300 ${initialData ? 'border-amber-200 shadow-amber-50' : 'border-purple-100'}`}>
      <h2 className="text-lg font-black text-slate-800 mb-2">{initialData ? 'Modifier la prestation' : 'Saisie de prestation'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
          <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required>
            {masterData.clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type de service</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required>
            {masterData.serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Effectif (Employés)</label>
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.employeeCount || ''} onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value) || 0})} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantité Entrée</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm" value={formData.weightIn || ''} onChange={e => setFormData({...formData, weightIn: parseFloat(e.target.value) || 0})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantité Sortie</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.weightOut || ''} onChange={e => setFormData({...formData, weightOut: parseFloat(e.target.value) || 0})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Pertes (Kg)</label>
          <input type="number" step="0.1" className="w-full bg-red-50 border border-red-100 rounded-xl px-3 py-3 text-sm font-bold text-red-600" value={formData.wasteKg || ''} onChange={e => setFormData({...formData, wasteKg: parseFloat(e.target.value) || 0})} required />
        </div>
      </div>

      <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs mt-4 transition-all active:scale-95 ${initialData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
        {initialData ? 'Mettre à jour la prestation' : 'Enregistrer la prestation'}
      </button>
    </form>
  );
};

export default PrestationProdModule;