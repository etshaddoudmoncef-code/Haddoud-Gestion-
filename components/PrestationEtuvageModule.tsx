import React, { useState, useEffect, useMemo } from 'react';
import { PrestationEtuvageRecord, MasterData } from '../types.ts';

interface PrestationEtuvageModuleProps {
  records: PrestationEtuvageRecord[];
  masterData: MasterData;
  onAdd: (data: Omit<PrestationEtuvageRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  onUpdate: (id: string, data: Partial<PrestationEtuvageRecord>) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const PrestationEtuvageModule: React.FC<PrestationEtuvageModuleProps> = ({ records, masterData, onAdd, onUpdate, onDelete, isAdmin }) => {
  const [subTab, setSubTab] = useState<'stats' | 'entry' | 'journal'>('stats');
  const [editingRecord, setEditingRecord] = useState<PrestationEtuvageRecord | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalAmount = monthlyRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalWeight = monthlyRecords.reduce((sum, r) => sum + r.weightIn, 0);
    const totalEmployees = monthlyRecords.reduce((sum, r) => sum + (r.employeeCount || 0), 0);
    
    const uniqueDays = new Set(monthlyRecords.map(r => r.date)).size;

    return { 
      totalAmount, 
      totalWeight, 
      count: monthlyRecords.length,
      avgEmployees: uniqueDays > 0 ? totalEmployees / uniqueDays : 0,
      avgYield: totalEmployees > 0 ? totalWeight / totalEmployees : 0,
      avgDailyWeight: uniqueDays > 0 ? totalWeight / uniqueDays : 0
    };
  }, [records]);

  const handleStartEdit = (record: PrestationEtuvageRecord) => {
    setEditingRecord(record);
    setSubTab('entry');
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('⚠️ Supprimer définitivement cet enregistrement d\'étuvage ?')) {
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
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${subTab === t ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t === 'stats' ? 'Résumé' : t === 'entry' ? 'Saisie' : 'Journal'}
          </button>
        ))}
      </div>

      {subTab === 'stats' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-3xl shadow-lg text-white">
            <p className="text-[10px] font-black uppercase mb-1 opacity-70">Revenu mensuel étuvage</p>
            <p className="text-3xl font-black">{stats.totalAmount.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-60">DA</span></p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
              <div>
                <p className="text-[9px] opacity-60 uppercase font-black">Moy. Journalière</p>
                <p className="text-lg font-bold">{stats.avgDailyWeight.toFixed(0)} <span className="text-[10px] font-normal">kg/j</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60 uppercase font-black">Total Poids</p>
                <p className="text-lg font-bold">{stats.totalWeight.toLocaleString()} <span className="text-[10px] font-normal">kg</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Moy. Employés/J</p>
                <p className="text-xl font-black text-orange-600">{stats.avgEmployees.toFixed(1)}</p>
             </div>
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Kg / Employé</p>
                <p className="text-xl font-black text-slate-800">{stats.avgYield.toFixed(1)}</p>
             </div>
          </div>
        </div>
      )}

      {subTab === 'entry' && (
        <PrestationEtuvageForm 
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
        <div className="space-y-2 animate-in fade-in duration-300">
          {records.length === 0 ? <p className="text-center py-10 text-slate-400 italic text-xs">Aucun enregistrement trouvé.</p> : 
            records.sort((a,b) => b.timestamp - a.timestamp).map(r => (
              <div key={r.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-slate-800">{r.clientName}</p>
                  <p className="text-[9px] text-slate-400">{new Date(r.date).toLocaleDateString()} • {r.employeeCount || 0} emp.</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-black">{r.durationHours}h</span>
                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">{r.humidityLevel}% Hum.</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-xs font-black text-slate-800">{r.weightIn}kg</p>
                      <p className="text-[10px] font-bold text-orange-600">{r.totalAmount.toLocaleString('fr-FR')} DA</p>
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

const PrestationEtuvageForm = ({ onSubmit, masterData, initialData }: { onSubmit: any, masterData: MasterData, initialData?: PrestationEtuvageRecord }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: 'N/A',
    clientName: masterData.clients[0] || '',
    weightIn: 0,
    weightOut: 0, 
    humidityLevel: 0,
    durationHours: 0,
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
        weightIn: initialData.weightIn,
        weightOut: initialData.weightOut,
        humidityLevel: initialData.humidityLevel,
        durationHours: initialData.durationHours,
        unitPrice: initialData.unitPrice,
        totalAmount: initialData.totalAmount,
        employeeCount: initialData.employeeCount || 0
      });
    }
  }, [initialData]);

  const updateAmount = (qty: number, price: number) => {
    setFormData(prev => ({ 
      ...prev, 
      weightIn: qty, 
      weightOut: qty, 
      unitPrice: price, 
      totalAmount: qty * price 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData(prev => ({ 
        ...prev, 
        weightIn: 0, 
        weightOut: 0, 
        humidityLevel: 0, 
        totalAmount: 0,
        employeeCount: 0
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-3xl shadow-sm border animate-in fade-in duration-300 ${initialData ? 'border-amber-200 shadow-amber-50' : 'border-orange-100'}`}>
      <h2 className="text-lg font-black text-slate-800 mb-2 text-orange-600">{initialData ? "Modifier l'étuvage" : "Saisie d'étuvage"}</h2>
      
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
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantité (Kg)</label>
          <input 
            type="number" 
            step="0.1"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black" 
            placeholder="0.0"
            value={formData.weightIn || ''} 
            onChange={e => updateAmount(parseFloat(e.target.value) || 0, formData.unitPrice)} 
            required 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Effectif (Employés)</label>
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.employeeCount || ''} onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value) || 0})} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durée (Heures)</label>
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.durationHours || ''} onChange={e => setFormData({...formData, durationHours: parseFloat(e.target.value) || 0})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Taux d'humidité (%)</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.humidityLevel || ''} onChange={e => setFormData({...formData, humidityLevel: parseFloat(e.target.value) || 0})} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prix/Kg (DA)</label>
          <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.unitPrice || ''} 
            onChange={e => updateAmount(formData.weightIn, parseFloat(e.target.value) || 0)} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total facturé</label>
          <div className="w-full bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm font-black text-orange-700">{formData.totalAmount.toLocaleString('fr-FR')} DA</div>
        </div>
      </div>
      
      <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs mt-4 transition-all active:scale-95 ${initialData ? "bg-amber-600 hover:bg-amber-700" : "bg-orange-600 hover:bg-orange-700"}`}>
        {initialData ? "Mettre à jour l'étuvage" : "Enregistrer l'étuvage"}
      </button>
    </form>
  );
};

export default PrestationEtuvageModule;