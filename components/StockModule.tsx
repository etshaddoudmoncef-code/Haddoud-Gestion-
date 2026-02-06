
import React, { useState, useMemo, useEffect } from 'react';
import { PurchaseRecord, StockOutRecord, MasterData, StockStatus } from '../types.ts';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

interface StockModuleProps {
  purchases: PurchaseRecord[];
  stockOuts: StockOutRecord[];
  masterData: MasterData;
  onAddPurchase: (data: Omit<PurchaseRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  onAddStockOut: (data: Omit<StockOutRecord, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  onUpdatePurchase: (id: string, data: Partial<PurchaseRecord>) => void;
  onUpdateStockOut: (id: string, data: Partial<StockOutRecord>) => void;
  onDeletePurchase: (id: string) => void;
  onDeleteStockOut: (id: string) => void;
  isAdmin: boolean;
}

const StockModule: React.FC<StockModuleProps> = ({ 
  purchases, 
  stockOuts, 
  masterData, 
  onAddPurchase, 
  onAddStockOut, 
  onUpdatePurchase,
  onUpdateStockOut,
  onDeletePurchase, 
  onDeleteStockOut, 
  isAdmin 
}) => {
  const [subTab, setSubTab] = useState<'realtime' | 'in' | 'out' | 'journal'>('realtime');
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [editingStockOut, setEditingStockOut] = useState<StockOutRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stockSummary = useMemo<StockStatus[]>(() => {
    const status: Record<string, { in: number, out: number }> = {};
    
    purchases.forEach(p => {
      if (!status[p.itemName]) status[p.itemName] = { in: 0, out: 0 };
      status[p.itemName].in += p.quantity;
    });

    stockOuts.forEach(s => {
      if (!status[s.itemName]) status[s.itemName] = { in: 0, out: 0 };
      status[s.itemName].out += s.quantity;
    });

    return Object.entries(status).map(([itemName, data]) => ({
      itemName,
      totalIn: data.in,
      totalOut: data.out,
      currentStock: data.in - data.out
    })).sort((a, b) => b.currentStock - a.currentStock);
  }, [purchases, stockOuts]);

  const filteredPurchases = useMemo(() => {
    const sorted = [...purchases].sort((a, b) => b.timestamp - a.timestamp);
    if (!searchTerm) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(p => p.lotNumber.toLowerCase().includes(term) || p.itemName.toLowerCase().includes(term) || p.supplierName.toLowerCase().includes(term));
  }, [purchases, searchTerm]);

  const filteredStockOuts = useMemo(() => {
    const sorted = [...stockOuts].sort((a, b) => b.timestamp - a.timestamp);
    if (!searchTerm) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(s => s.lotNumber.toLowerCase().includes(term) || s.itemName.toLowerCase().includes(term) || s.reason.toLowerCase().includes(term));
  }, [stockOuts, searchTerm]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleStartEditPurchase = (p: PurchaseRecord) => {
    setEditingPurchase(p);
    setSubTab('in');
  };

  const handleStartEditStockOut = (s: StockOutRecord) => {
    setEditingStockOut(s);
    setSubTab('out');
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'realtime', label: 'En Stock' },
          { id: 'in', label: 'Entrée' },
          { id: 'out', label: 'Sortie' },
          { id: 'journal', label: 'Journal' }
        ].map((t) => (
          <button 
            key={t.id}
            onClick={() => {
              setSubTab(t.id as any);
              if (t.id !== 'in') setEditingPurchase(null);
              if (t.id !== 'out') setEditingStockOut(null);
            }}
            className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${subTab === t.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'realtime' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 gap-4">
            {stockSummary.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic bg-white rounded-3xl border border-slate-100">
                Aucun produit en stock.
              </div>
            ) : (
              stockSummary.map((item) => (
                <div key={item.itemName} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-800 mb-1">{item.itemName}</h3>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Entrées</span>
                        <span className="text-xs font-bold text-emerald-600">+{item.totalIn}kg</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Sorties</span>
                        <span className="text-xs font-bold text-red-500">-{item.totalOut}kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Stock Réel</span>
                    <span className={`text-2xl font-black ${item.currentStock <= 10 ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.currentStock.toLocaleString()} <span className="text-xs font-normal">kg</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-64">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4">Volume Stock Actuel</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockSummary}>
                <XAxis dataKey="itemName" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="currentStock" radius={[4, 4, 0, 0]}>
                  {stockSummary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {subTab === 'in' && (
        <StockInForm 
          onSubmit={(d) => {
            if (editingPurchase) {
              onUpdatePurchase(editingPurchase.id, d);
              setEditingPurchase(null);
              setSubTab('journal');
            } else {
              onAddPurchase(d);
            }
          }} 
          masterData={masterData} 
          initialData={editingPurchase || undefined}
        />
      )}

      {subTab === 'out' && (
        <StockOutForm 
          onSubmit={(d) => {
            if (editingStockOut) {
              onUpdateStockOut(editingStockOut.id, d);
              setEditingStockOut(null);
              setSubTab('journal');
            } else {
              onAddStockOut(d);
            }
          }} 
          masterData={masterData} 
          initialData={editingStockOut || undefined}
        />
      )}

      {subTab === 'journal' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="relative px-2">
            <input 
              type="text" 
              placeholder="Rechercher lot, fournisseur, motif..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-2">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase">Entrées (Achats)</h4>
              <span className="text-[9px] text-slate-400 font-bold">{filteredPurchases.length} résultats</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
              {filteredPurchases.length === 0 ? <p className="text-center text-[10px] text-slate-400 italic p-4">Aucune entrée trouvée.</p> : 
                filteredPurchases.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm flex justify-between items-center hover:border-emerald-300 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.itemName} <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded">#{p.lotNumber}</span></p>
                      <p className="text-[9px] text-slate-500 truncate">{new Date(p.date).toLocaleDateString()} • {p.supplierName}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 block">+{p.quantity}kg</span>
                        <span className="text-[8px] text-slate-400">{p.totalAmount.toLocaleString()} DA</span>
                      </div>
                      <div className="flex gap-1">
                        {isAdmin && (
                          <button onClick={() => handleStartEditPurchase(p)} className="text-amber-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-lg transition-all active:scale-90">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                          </button>
                        )}
                        <button onClick={() => confirm('Supprimer cet achat ?') && onDeletePurchase(p.id)} className="text-slate-200 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all active:scale-90"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-2">
              <h4 className="text-[10px] font-black text-orange-600 uppercase">Sorties (Production/Rebut)</h4>
              <span className="text-[9px] text-slate-400 font-bold">{filteredStockOuts.length} résultats</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
              {filteredStockOuts.length === 0 ? <p className="text-center text-[10px] text-slate-400 italic p-4">Aucune sortie trouvée.</p> : 
                filteredStockOuts.map(s => (
                  <div key={s.id} className="bg-white p-3 rounded-2xl border border-orange-100 shadow-sm flex justify-between items-center hover:border-orange-300 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.itemName} <span className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded">#{s.lotNumber}</span></p>
                      <p className="text-[9px] text-slate-500 truncate">{new Date(s.date).toLocaleDateString()} • {s.reason}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-xs font-black text-orange-600">-{s.quantity}kg</span>
                      <div className="flex gap-1">
                        {isAdmin && (
                          <button onClick={() => handleStartEditStockOut(s)} className="text-amber-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-lg transition-all active:scale-90">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                          </button>
                        )}
                        <button onClick={() => confirm('Supprimer cette sortie ?') && onDeleteStockOut(s.id)} className="text-slate-200 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all active:scale-90"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StockInForm = ({ onSubmit, masterData, initialData }: { onSubmit: any, masterData: MasterData, initialData?: PurchaseRecord }) => {
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        lotNumber: initialData.lotNumber,
        supplierName: initialData.supplierName,
        itemName: initialData.itemName,
        variety: initialData.variety || '',
        category: initialData.category,
        quantity: initialData.quantity,
        unit: initialData.unit,
        unitPrice: initialData.unitPrice,
        totalAmount: initialData.totalAmount,
        infestationRate: initialData.infestationRate
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lotNumber) return alert("Numéro de lot requis");
    onSubmit(formData);
    if (!initialData) {
      setFormData(prev => ({ ...prev, lotNumber: '', quantity: 0, unitPrice: 0, totalAmount: 0 }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 bg-white p-6 rounded-3xl shadow-sm border animate-in fade-in duration-300 ${initialData ? 'border-amber-200 ring-4 ring-amber-50' : 'border-emerald-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-black text-slate-800">{initialData ? 'Modifier Entrée Stock' : 'Entrée Stock (Achat)'}</h2>
        {initialData && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Admin : Mode Édition</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Date</label>
          <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Lot</label>
          <input type="text" className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.lotNumber} onChange={e => setFormData({...formData, lotNumber: e.target.value.toUpperCase()})} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Produit</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} required>
            {masterData.products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Fournisseur</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} required>
            {masterData.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Qté (Kg)</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0, totalAmount: (parseFloat(e.target.value) || 0) * formData.unitPrice})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">P.U (DA)</label>
          <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold" value={formData.unitPrice || ''} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0, totalAmount: (parseFloat(e.target.value) || 0) * formData.quantity})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Total</label>
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 text-sm font-black text-emerald-700">{formData.totalAmount.toLocaleString('fr-FR')} DA</div>
        </div>
      </div>
      <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs mt-4 transition-all active:scale-95 ${initialData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
        {initialData ? 'Appliquer les modifications (Admin)' : 'Valider l\'Entrée'}
      </button>
    </form>
  );
};

const StockOutForm = ({ onSubmit, masterData, initialData }: { onSubmit: any, masterData: MasterData, initialData?: StockOutRecord }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    itemName: masterData.products[0] || '',
    quantity: 0,
    reason: 'Production Journalière'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        lotNumber: initialData.lotNumber,
        itemName: initialData.itemName,
        quantity: initialData.quantity,
        reason: initialData.reason
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData(prev => ({ ...prev, lotNumber: '', quantity: 0 }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 bg-white p-6 rounded-3xl shadow-sm border animate-in fade-in duration-300 ${initialData ? 'border-amber-200 ring-4 ring-amber-50' : 'border-orange-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className={`text-lg font-black ${initialData ? 'text-slate-800' : 'text-orange-600'}`}>
          {initialData ? 'Modifier Sortie Stock' : 'Sortie Stock (Production)'}
        </h2>
        {initialData && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Admin : Mode Édition</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Date</label>
          <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Lot utilisé</label>
          <input type="text" className="w-full bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-orange-500 outline-none" value={formData.lotNumber} onChange={e => setFormData({...formData, lotNumber: e.target.value.toUpperCase()})} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Produit</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} required>
            {masterData.products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Qté (Kg)</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})} required />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Motif / Destination</label>
        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Production jour / Rebut / Don..." required />
      </div>
      <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs mt-4 transition-all active:scale-95 ${initialData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
        {initialData ? 'Appliquer les modifications (Admin)' : 'Valider la Sortie'}
      </button>
    </form>
  );
};

export default StockModule;
