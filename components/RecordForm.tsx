
import React, { useState, useEffect } from 'react';
import { ProductionRecord, MasterData } from '../types.ts';

interface RecordFormProps {
  onSubmit: (record: Omit<ProductionRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  masterData: MasterData;
  initialData?: ProductionRecord;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, masterData, initialData }) => {
  const [formData, setFormData] = useState({
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
    if (initialData) {
      setFormData({
        date: initialData.date,
        lotNumber: initialData.lotNumber,
        clientName: initialData.clientName,
        productName: initialData.productName,
        packaging: initialData.packaging,
        employeeCount: initialData.employeeCount,
        totalProduction: initialData.totalProduction,
        totalWeightKg: initialData.totalWeightKg,
        wasteKg: initialData.wasteKg,
        infestationRate: initialData.infestationRate
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.lotNumber) {
      alert("Veuillez renseigner le client et le numéro de lot.");
      return;
    }
    onSubmit(formData);
    if (!initialData) {
      setFormData(prev => ({
        ...prev,
        totalProduction: 0,
        totalWeightKg: 0,
        wasteKg: 0,
        infestationRate: 0
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 bg-white p-6 rounded-3xl shadow-sm border animate-in fade-in duration-300 ${initialData ? 'border-amber-200 shadow-amber-50' : 'border-slate-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-black text-slate-800">{initialData ? 'Modification de Production' : 'Saisie de Production'}</h2>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${initialData ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
          {initialData ? 'Mode Édition' : 'Session de travail'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Date</label>
          <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Numéro de Lot</label>
          <input 
            type="text" 
            placeholder="Ex: LOT-24-001" 
            className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm font-black text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none" 
            value={formData.lotNumber} 
            onChange={e => setFormData({...formData, lotNumber: e.target.value.toUpperCase()})} 
            required 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Client Destinataire</label>
        <select 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          value={formData.clientName}
          onChange={e => setFormData({...formData, clientName: e.target.value})}
          required
        >
          {masterData.clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Produit</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} required>
            {masterData.products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Emballage</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={formData.packaging} onChange={e => setFormData({...formData, packaging: e.target.value})} required>
            {masterData.packagings.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Effectif (Employés)</label>
        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.employeeCount || ''} onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value) || 0})} required />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Unités</label>
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.totalProduction || ''} onChange={e => setFormData({...formData, totalProduction: parseInt(e.target.value) || 0})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Poids Brut (Kg)</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.totalWeightKg || ''} onChange={e => setFormData({...formData, totalWeightKg: parseFloat(e.target.value) || 0})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-red-400 uppercase mb-1 ml-1">Pertes (Kg)</label>
          <input type="number" step="0.1" className="w-full bg-red-50 border border-red-100 rounded-xl px-3 py-3 text-sm font-bold text-red-600" value={formData.wasteKg || ''} onChange={e => setFormData({...formData, wasteKg: parseFloat(e.target.value) || 0})} required />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Taux d'Infestation : <span className="text-blue-600">{formData.infestationRate}%</span></label>
        <input type="range" min="0" max="100" step="0.5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" value={formData.infestationRate} onChange={e => setFormData({...formData, infestationRate: parseFloat(e.target.value)})} />
      </div>

      <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs mt-4 transition-all active:scale-95 ${initialData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {initialData ? 'Mettre à jour la production' : 'Valider la production'}
      </button>
    </form>
  );
};

export default RecordForm;
