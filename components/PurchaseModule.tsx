import React, { useState, useMemo } from 'react';
import { PurchaseRecord, MasterData } from '../types.ts';
import { CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area } from 'recharts';

interface PurchaseModuleProps {
  records: PurchaseRecord[];
  masterData: MasterData;
  onSubmit: (data: Omit<PurchaseRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const PurchaseModule: React.FC<PurchaseModuleProps> = ({ records, masterData, onSubmit, onDelete, isAdmin }) => {
  const [subTab, setSubTab] = useState<'stats' | 'entry' | 'history'>('stats');

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpentMonth = currentMonthRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const byCategory: Record<string, number> = {};
    currentMonthRecords.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.totalAmount;
    });

    const totalSpentGlobal = records.reduce((sum, r) => sum + r.totalAmount, 0);

    const monthlyData: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    records.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key] += r.totalAmount;
      }
    });

    const trendData = Object.entries(monthlyData).map(([key, value]) => {
      const [year, month] = key.split('-');
      const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('fr-FR', { month: 'short' });
      return { name: label, total: value };
    });

    return {
      totalSpentMonth,
      totalSpentGlobal,
      countMonth: currentMonthRecords.length,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      trendData
    };
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-6">
        {['stats', 'entry', 'history'].map((t) => (
          <button 
            key={t}
            onClick={() => setSubTab(t as any)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${subTab === t ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t === 'stats' ? 'Résumé' : t === 'entry' ? 'Réception' : 'Journal'}
          </button>
        ))}
      </div>

      {subTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl shadow-lg col-span-2 text-white">
              <p className="text-[9px] font-black uppercase mb-1 opacity-80">Total Cumulé (Global)</p>
              <p className="text-3xl font-black">{stats.totalSpentGlobal.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-60">DA</span></p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Ce Mois</p>
              <p className="text-xl font-bold text-emerald-600">{stats.totalSpentMonth.toLocaleString('fr-FR')} DA</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Réceptions (Mois)</p>
              <p className="text-xl font-bold text-slate-800">{stats.countMonth}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-56">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4">Évolution des achats (6 mois)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                  formatter={(val: number) => [`${val.toLocaleString('fr-FR')} DA`, 'Total']}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" fill="#ecfdf5" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-64">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4">Répartition par catégorie (Mois)</h3>
            {stats.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCategory} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} labelStyle={{fontSize: '10px'}} itemStyle={{fontSize: '10px'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {stats.byCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Aucune donnée ce mois</div>
            )}
          </div>
        </div>
      )}

      {subTab === 'entry' && (
        <PurchaseForm onSubmit={onSubmit} masterData={masterData} />
      )}

      {subTab === 'history' && (
        <PurchaseHistory records={records} onDelete={onDelete} isAdmin={isAdmin} />
      )}
    </div>
  );
};

const PurchaseForm = ({ onSubmit, masterData }: { onSubmit: any, masterData: MasterData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    supplierName: masterData.suppliers[0] || '',
    itemName: masterData.products[0] || '',
    variety: '',
    category: masterData.purchaseCategories[0] || '',
    quantity: 0,
    unit: 'Kg',
    unitPrice: 0,
    totalAmount: 0,
    infestationRate: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName || !formData.itemName || !formData.lotNumber) {
      alert("Veuillez remplir le fournisseur, l'article et le numéro de lot.");
      return;
    }
    onSubmit(formData);
    setFormData(prev => ({ 
      ...prev, 
      lotNumber: '',
      variety: '', 
      quantity: 0, 
      unitPrice: 0, 
      totalAmount: 0,
      infestationRate: 0 
    }));
  };

  const updateAmount = (q: number, p: number) => {
    setFormData(prev => ({ ...prev, quantity: q, unitPrice: p, totalAmount: q * p }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-black text-slate-800">Réception Marchandise</h2>
        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Bon de réception</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Date Réception</label>
          <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Numéro de Lot</label>
          <input 
            type="text" 
            placeholder="Ex: LOT-24-001" 
            className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none" 
            value={formData.lotNumber} 
            onChange={e => setFormData({...formData, lotNumber: e.target.value.toUpperCase()})} 
            required 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Fournisseur</label>
        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} required>
          {masterData.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Article / Produit</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} required>
            {masterData.products.map(p => <option key={p} value={p}>{p}</option>)}
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Variété</label>
          <input type="text" placeholder="Ex: Marinda, Cobra..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Catégorie Comptable</label>
        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
          {masterData.purchaseCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Qté (Kg)</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.quantity || ''} onChange={e => updateAmount(parseFloat(e.target.value) || 0, formData.unitPrice)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Prix au Kg (DA)</label>
          <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.unitPrice || ''} onChange={e => updateAmount(formData.quantity, parseFloat(e.target.value) || 0)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Total (DA)</label>
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 text-sm font-black text-emerald-700">{formData.totalAmount.toLocaleString('fr-FR')}</div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
          Infestation à la réception : <span className="text-emerald-600">{formData.infestationRate}%</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="1"
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          value={formData.infestationRate}
          onChange={e => setFormData({...formData, infestationRate: parseFloat(e.target.value)})}
        />
        <div className="flex justify-between text-[8px] text-slate-400 mt-1 uppercase font-black">
          <span>Sain</span>
          <span>Inutilisable</span>
        </div>
      </div>

      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 uppercase tracking-widest text-xs mt-4">
        Valider la réception
      </button>
    </form>
  );
};

const PurchaseHistory = ({ records, onDelete, isAdmin }: { records: PurchaseRecord[], onDelete: any, isAdmin: boolean }) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {records.length === 0 ? (
        <p className="text-center text-slate-400 text-xs italic py-10">Aucun achat enregistré.</p>
      ) : (
        records.sort((a,b) => b.timestamp - a.timestamp).map(r => (
          <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${r.infestationRate > 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {r.infestationRate}%
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-xs font-black text-slate-800 truncate">{r.itemName}</span>
                <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black tracking-tighter">#{r.lotNumber}</span>
                {r.variety && <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{r.variety}</span>}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{r.supplierName} • {new Date(r.date).toLocaleDateString('fr-FR')}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[9px] text-slate-500">Total: <b className="text-emerald-600">{r.totalAmount.toLocaleString('fr-FR')} DA</b></span>
                <span className="text-[9px] text-slate-500">P.U: <b className="text-slate-700">{r.unitPrice.toLocaleString('fr-FR')} DA/kg</b></span>
                <span className="text-[9px] text-slate-500">Qté: <b className="text-slate-700">{r.quantity}kg</b></span>
              </div>
            </div>
            <button 
              onClick={() => window.confirm('Supprimer définitivement cet achat ?') && onDelete(r.id)} 
              className="p-2 text-slate-200 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default PurchaseModule;