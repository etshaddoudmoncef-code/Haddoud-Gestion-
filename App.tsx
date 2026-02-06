
import React, { useState, useEffect, useMemo } from 'react';
import { ProductionRecord, MasterData } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Export generateId to be used by other components
export const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_MASTER: MasterData = {
  products: ['Tomate Roma', 'Tomate Cerise', 'Poivron', 'Concombre'],
  clients: ['Local Market', 'Export FR', 'Export DE'],
  packagings: ['Caisse 10kg', 'Caisse 5kg', 'Plateau'],
  suppliers: ['AgriPlus', 'Sidi Bel Abbes', 'Local Farmer'],
  purchaseCategories: ['Intrants', 'Emballages', 'Maintenance'],
  serviceTypes: ['Triage', 'Calibrage', 'Conditionnement']
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dash' | 'form' | 'history' | 'admin'>('dash');
  const [records, setRecords] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem('haddoud_v2_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [master, setMaster] = useState<MasterData>(() => {
    const saved = localStorage.getItem('haddoud_v2_master');
    return saved ? JSON.parse(saved) : DEFAULT_MASTER;
  });
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    localStorage.setItem('haddoud_v2_records', JSON.stringify(records));
    localStorage.setItem('haddoud_v2_master', JSON.stringify(master));
  }, [records, master]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecs = records.filter(r => r.date === today);
    return {
      totalKg: todayRecs.reduce((acc, r) => acc + (r.totalWeightKg || 0), 0),
      totalEmployees: todayRecs.reduce((acc, r) => acc + (r.employeeCount || 0), 0),
      count: todayRecs.length
    };
  }, [records]);

  const addRecord = (data: Omit<ProductionRecord, 'id' | 'timestamp'>) => {
    const newRecord = { ...data, id: generateId(), timestamp: Date.now() };
    setRecords([newRecord as ProductionRecord, ...records]);
    setActiveTab('dash');
  };

  const deleteRecord = (id: string) => {
    if(confirm('Supprimer ce record ?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const runAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      // Use correct initialization and direct generateContent call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = records.slice(0, 5).map(r => `${r.productName}: ${r.totalWeightKg}kg avec ${r.employeeCount} employés`).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyse cette production (Ets Haddoud Moncef) et donne 1 conseil : ${summary}`
      });
      // Directly access .text property
      setAiAnalysis(response.text || "Analyse indisponible");
    } catch (e) {
      setAiAnalysis("Erreur IA: Clé API manquante ou invalide.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 rounded-b-[2.5rem] shadow-xl">
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Ets Haddoud Moncef</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Management Production</p>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'dash' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Production (Kg)</p>
                <h3 className="text-3xl font-black text-blue-600">{metrics.totalKg.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Employés</p>
                <h3 className="text-3xl font-black text-slate-800">{metrics.totalEmployees}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-64">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4">Évolution Récente</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={records.slice(0, 7).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" fontSize={8} tickFormatter={(v) => v.split('-')[2]} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px', border: 'none' }} />
                  <Area type="monotone" dataKey="totalWeightKg" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <button onClick={runAiAnalysis} className="w-full bg-indigo-600 text-white p-5 rounded-[2rem] shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
              <span className="text-xl">✨</span>
              <span className="text-xs font-black uppercase tracking-widest">{loadingAi ? 'Analyse...' : 'Analyse IA Strategique'}</span>
            </button>
            {aiAnalysis && (
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[2rem] text-xs font-medium text-indigo-900 leading-relaxed italic animate-in zoom-in-95">
                "{aiAnalysis}"
              </div>
            )}
          </div>
        )}

        {activeTab === 'form' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in zoom-in-95">
            <h2 className="text-lg font-black uppercase text-slate-800 mb-6">Saisie Production</h2>
            <RecordForm master={master} onAdd={addRecord} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {records.length === 0 ? (
              <p className="text-center py-10 text-slate-400 italic">Aucune donnée enregistrée.</p>
            ) : (
              records.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-600 px-2 py-0.5 rounded">#{r.lotNumber}</span>
                      <span className="text-xs font-black text-slate-800">{r.clientName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{r.productName} • {r.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{r.totalWeightKg}kg</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{r.employeeCount} PERS.</p>
                    </div>
                    <button onClick={() => deleteRecord(r.id)} className="text-red-200 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminPanel master={master} setMaster={setMaster} />
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/20 p-2 rounded-[2.5rem] shadow-2xl flex justify-between items-center z-50">
        {[
          { id: 'dash', icon: '🏠', label: 'Bord' },
          { id: 'form', icon: '📝', label: 'Saisie' },
          { id: 'history', icon: '🕒', label: 'Journal' },
          { id: 'admin', icon: '⚙️', label: 'Admin' }
        ].map(btn => (
          <button 
            key={btn.id}
            onClick={() => setActiveTab(btn.id as any)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-[1.8rem] transition-all ${activeTab === btn.id ? 'bg-slate-900 text-white shadow-xl scale-110' : 'text-slate-400'}`}
          >
            <span className="text-xl mb-0.5">{btn.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{btn.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function RecordForm({ master, onAdd }: { master: MasterData, onAdd: any }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    lotNumber: '',
    clientName: master.clients[0] || '',
    productName: master.products[0] || '',
    employeeCount: 0,
    totalWeightKg: 0,
    wasteKg: 0,
    infestationRate: 0
  });

  const h = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.lotNumber) return alert('Lot requis');
    onAdd(form);
  };

  const inputClass = "w-full bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none";
  const labelClass = "block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1";

  return (
    <form onSubmit={h} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        </div>
        <div>
          <label className={labelClass}>N° Lot</label>
          <input type="text" className={inputClass} value={form.lotNumber} onChange={e => setForm({...form, lotNumber: e.target.value.toUpperCase()})} placeholder="LOT-01" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Produit</label>
        <select className={inputClass} value={form.productName} onChange={e => setForm({...form, productName: e.target.value})}>
          {master.products.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Client</label>
        <select className={inputClass} value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})}>
          {master.clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Employés (P)</label>
          <input type="number" className={inputClass} value={form.employeeCount || ''} onChange={e => setForm({...form, employeeCount: parseInt(e.target.value) || 0})} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Poids Brut (Kg)</label>
          <input type="number" step="0.1" className={inputClass} value={form.totalWeightKg || ''} onChange={e => setForm({...form, totalWeightKg: parseFloat(e.target.value) || 0})} placeholder="0.0" />
        </div>
      </div>
      <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black uppercase text-xs tracking-widest mt-4 shadow-xl active:scale-95 transition-all">Valider la Production</button>
    </form>
  );
}

function AdminPanel({ master, setMaster }: { master: MasterData, setMaster: any }) {
  const [newP, setNewP] = useState('');
  const [newC, setNewC] = useState('');

  const addP = () => { if(newP) { setMaster({...master, products: [...master.products, newP]}); setNewP(''); }};
  const addC = () => { if(newC) { setMaster({...master, clients: [...master.clients, newC]}); setNewC(''); }};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-widest">Liste Produits</h3>
        <div className="flex gap-2 mb-4">
          <input className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-xs" value={newP} onChange={e => setNewP(e.target.value)} placeholder="Nouveau..." />
          <button onClick={addP} className="bg-slate-900 text-white px-4 rounded-xl text-lg">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {master.products.map(p => <span key={p} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-100">{p}</span>)}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black uppercase text-purple-600 mb-4 tracking-widest">Liste Clients</h3>
        <div className="flex gap-2 mb-4">
          <input className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-xs" value={newC} onChange={e => setNewC(e.target.value)} placeholder="Nouveau..." />
          <button onClick={addC} className="bg-slate-900 text-white px-4 rounded-xl text-lg">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {master.clients.map(c => <span key={c} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-100">{c}</span>)}
        </div>
      </div>

      <button onClick={() => { localStorage.clear(); location.reload(); }} className="w-full text-red-500 font-black uppercase text-[9px] tracking-widest mt-12 py-4">Effacer toutes les données (Réinitialiser)</button>
    </div>
  );
}
