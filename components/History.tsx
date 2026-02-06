import React, { useMemo, useState } from 'react';
import { ProductionRecord } from '../types.ts';

interface HistoryProps {
  records: ProductionRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ProductionRecord) => void;
  isAdmin: boolean;
}

const History: React.FC<HistoryProps> = ({ records, onDelete, onEdit, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Génération des options d'années basées sur les données
  const years = useMemo(() => {
    // Fix: Explicitly type the Set as number to avoid arithmetic operation errors during sort on line 21
    const uniqueYears = new Set<number>(records.map(r => new Date(r.date).getFullYear()));
    return Array.from(uniqueYears).sort((a: number, b: number) => b - a);
  }, [records]);

  const months = [
    { v: '01', l: 'Janvier' }, { v: '02', l: 'Février' }, { v: '03', l: 'Mars' },
    { v: '04', l: 'Avril' }, { v: '05', l: 'Mai' }, { v: '06', l: 'Juin' },
    { v: '07', l: 'Juillet' }, { v: '08', l: 'Août' }, { v: '09', l: 'Septembre' },
    { v: '10', l: 'Octobre' }, { v: '11', l: 'Novembre' }, { v: '12', l: 'Décembre' }
  ];

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const dateObj = new Date(r.date);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear());

      const matchSearch = !searchTerm || 
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDay = !filterDay || day === filterDay.padStart(2, '0');
      const matchMonth = !filterMonth || month === filterMonth;
      const matchYear = !filterYear || year === filterYear;

      return matchSearch && matchDay && matchMonth && matchYear;
    });
  }, [records, searchTerm, filterDay, filterMonth, filterYear]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, {
      label: string,
      records: ProductionRecord[],
      summary: { totalU: number, totalKg: number, totalWaste: number, avgYieldKg: number, avgInf: number }
    }> = {};

    filteredRecords.forEach(r => {
      const date = new Date(r.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

      if (!groups[key]) {
        groups[key] = { label, records: [], summary: { totalU: 0, totalKg: 0, totalWaste: 0, avgYieldKg: 0, avgInf: 0 } };
      }
      groups[key].records.push(r);
    });

    Object.keys(groups).forEach(key => {
      const group = groups[key];
      const totalKg = group.records.reduce((sum, r) => sum + (r.totalWeightKg || 0), 0);
      const totalWaste = group.records.reduce((sum, r) => sum + (r.wasteKg || 0), 0);
      const totalEmp = group.records.reduce((sum, r) => sum + r.employeeCount, 0);
      const totalInf = group.records.reduce((sum, r) => sum + r.infestationRate, 0);
      group.summary = {
        totalU: group.records.reduce((sum, r) => sum + r.totalProduction, 0),
        totalKg,
        totalWaste,
        avgYieldKg: totalKg / (totalEmp || 1),
        avgInf: totalInf / group.records.length
      };
      group.records.sort((a, b) => b.timestamp - a.timestamp);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredRecords]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDay('');
    setFilterMonth('');
    setFilterYear('');
  };

  const activeFiltersCount = [filterDay, filterMonth, filterYear].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="space-y-4 px-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {isAdmin ? "Journal d'Administration" : "Mon Journal Production"}
          </h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input 
                type="text" 
                placeholder="Client, Lot, Produit..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${showFilters || activeFiltersCount > 0 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>
          </div>
        </div>

        {/* Panneau de filtres avancés */}
        {showFilters && (
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Jour</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[10px] font-bold outline-none"
                  value={filterDay}
                  onChange={e => setFilterDay(e.target.value)}
                >
                  <option value="">Tous</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                    <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Mois</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[10px] font-bold outline-none"
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                >
                  <option value="">Tous</option>
                  {months.map(m => (
                    <option key={m.v} value={m.v}>{m.l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Année</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[10px] font-bold outline-none"
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                >
                  <option value="">Toutes</option>
                  {years.map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400">
                {filteredRecords.length} résultats filtrés
              </span>
              <button 
                onClick={resetFilters}
                className="text-[10px] font-black text-red-500 uppercase hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>
      
      {groupedRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center mx-2">
          <p className="text-slate-400 text-sm italic font-medium">Aucun enregistrement ne correspond à vos critères.</p>
          <button onClick={resetFilters} className="mt-4 text-blue-600 font-bold text-xs uppercase underline">Voir tout l'historique</button>
        </div>
      ) : (
        groupedRecords.map(([key, group]) => (
          <div key={key} className="space-y-3 px-2">
            <div className={`p-4 rounded-3xl shadow-sm border ${isAdmin ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest">{group.label}</h3>
                <span className="text-[9px] font-bold opacity-60 bg-white/10 px-2 py-0.5 rounded-full">{group.records.length} opérations</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center border-t border-white/10 pt-3">
                <div>
                  <p className="text-[7px] opacity-60 uppercase font-black mb-0.5">Prod. Total</p>
                  <p className="text-[11px] font-black">{group.summary.totalKg.toLocaleString()} <span className="text-[8px] opacity-40">kg</span></p>
                </div>
                <div>
                  <p className="text-[7px] opacity-60 uppercase font-black mb-0.5 text-red-400">Pertes</p>
                  <p className="text-[11px] font-black text-red-400">{group.summary.totalWaste.toLocaleString()}</p>
                </div>
                <div className="border-x border-white/10 px-1">
                  <p className="text-[7px] opacity-60 uppercase font-black mb-0.5">Rend. Moy.</p>
                  <p className="text-[11px] font-black">{group.summary.avgYieldKg.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[7px] opacity-60 uppercase font-black mb-0.5">Qualité</p>
                  <p className="text-[11px] font-black">{(100 - group.summary.avgInf).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {group.records.map(record => (
                <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-blue-200 transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0">
                    <span className="text-[8px] font-black text-slate-400 leading-none mb-1">JOUR</span>
                    <span className="text-sm font-black text-blue-600 leading-none">{record.date.split('-')[2]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-black text-slate-800 truncate uppercase">{record.clientName}</span>
                      <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-lg font-black tracking-tight shrink-0 shadow-sm shadow-blue-100">#{record.lotNumber}</span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-bold">Produit : <b className="text-slate-800">{record.productName}</b></span>
                      <span className="text-[10px] text-slate-500 font-bold">Poids : <b className="text-blue-600">{record.totalWeightKg}kg</b></span>
                      <span className="text-[10px] text-red-400 font-bold">Perte : {record.wasteKg}kg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button 
                        onClick={() => onEdit(record)} 
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                      </button>
                    )}
                    <button 
                      onClick={() => confirm('Supprimer définitivement cet enregistrement ?') && onDelete(record.id)} 
                      className="p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default History;