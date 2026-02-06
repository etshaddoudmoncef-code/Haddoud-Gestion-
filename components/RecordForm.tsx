import React, { useState, useEffect } from 'react';
import { ProductionRecord, MasterData } from '../types.ts';

interface Props {
  onSubmit: (record: Omit<ProductionRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  masterData: MasterData;
  initialData?: ProductionRecord;
}

const RecordForm: React.FC<Props> = ({ onSubmit, masterData, initialData }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    clientName: masterData.clients[0] || '',
    productName: masterData.products[0] || '',
    packaging: masterData.packagings[0] || '',
    employeeCount: 0,
    totalProduction: 0,
    totalWeightKg: 0,
    wasteKg: 0,
    infestationRate: 0
  });

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lotNumber) return alert("Lot requis");
    onSubmit(form);
  };

  const inputClass = "w-full bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6 animate-in zoom-in-95 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
        </div>
        <div>
          <label className={labelClass}>Numéro de Lot</label>
          <input type="text" className={inputClass + " uppercase text-blue-600"} placeholder="LOT-XXXX" value={form.lotNumber} onChange={e => setForm({...form, lotNumber: e.target.value})} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>Client</label>
        <select className={inputClass} value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})}>
          {masterData.clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Produit</label>
          <select className={inputClass} value={form.productName} onChange={e => setForm({...form, productName: e.target.value})}>
            {masterData.products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Emballage</label>
          <select className={inputClass} value={form.packaging} onChange={e => setForm({...form, packaging: e.target.value})}>
            {masterData.packagings.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Employés</label>
          <input type="number" className={inputClass} value={form.employeeCount || ''} onChange={e => setForm({...form, employeeCount: parseInt(e.target.value) || 0})} required />
        </div>
        <div>
          <label className={labelClass}>Poids Brut (Kg)</label>
          <input type="number" step="0.1" className={inputClass} value={form.totalWeightKg || ''} onChange={e => setForm({...form, totalWeightKg: parseFloat(e.target.value) || 0})} required />
        </div>
        <div>
          <label className={labelClass}>Pertes (Kg)</label>
          <input type="number" step="0.1" className={inputClass + " text-red-500"} value={form.wasteKg || ''} onChange={e => setForm({...form, wasteKg: parseFloat(e.target.value) || 0})} required />
        </div>
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">
        {initialData ? 'Mettre à jour' : 'Enregistrer la production'}
      </button>
    </form>
  );
};

export default RecordForm;