
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

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(r => 
      r.clientName.toLowerCase().includes(term) || 
      r.lotNumber.toLowerCase().includes(term) ||
      r.productName.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <h2 className="text-lg font-bold text-slate-800">
          {isAdmin ? "Journal Global d'Administration" : "Mon Journal de Production"}
        </h2>
        
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Rechercher lot, client..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>
      
      {groupedRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
          <p className="text-slate-400 text-sm italic">Aucun enregistrement trouvé.</p>
        </div>
      ) : (
        groupedRecords.map(([key, group]) => (
          <div key={key} className="space-y-3">
            <div className={`p-4 rounded-2xl shadow-sm border ${isAdmin ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-tighter">{group.label}</h3>
                <span className="text-[9px] font-bold opacity-60">{group.records.length} entrées</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center border-t border-white/10 pt-3">
                <div>
                  <p className="text-[6px] opacity-60 uppercase font-black">Prod. (Kg)</p>
                  <p className="text-[10px] font-bold">{group.summary.totalKg.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[6px] opacity-60 uppercase font-black text-red-400">Pertes</p>
                  <p className="text-[10px] font-bold text-red-400">{group.summary.totalWaste.toFixed(0)}</p>
                </div>
                <div className="border-x border-white/10">
                  <p className="text-[6px] opacity-60 uppercase font-black">Rend./Emp.</p>
                  <p className="text-[10px] font-bold">{group.summary.avgYieldKg.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[6px] opacity-60 uppercase font-black">Infest.</p>
                  <p className="text-[10px] font-bold">{group.summary.avgInf.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {group.records.map(record => (
                <div key={record.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-blue-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-blue-600 border border-slate-100 shrink-0">
                    {record.date.split('-')[2]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-slate-800 truncate">{record.clientName}</span>
                      <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black tracking-tighter shrink-0">#{record.lotNumber}</span>
                      <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">{record.productName}</span>
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <span className="text-[9px] text-slate-400">Poids : <b className="text-slate-700">{record.totalWeightKg}kg</b></span>
                      <span className="text-[9px] text-red-400">Déchets : <b className="text-red-600">{record.wasteKg}kg</b></span>
                      {isAdmin && <span className="text-[8px] text-slate-300 italic truncate max-w-[80px]">Par {record.userName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button 
                        onClick={() => onEdit(record)} 
                        title="Modifier la saisie"
                        className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                      </button>
                    )}
                    <button 
                      onClick={() => confirm('Supprimer définitivement cet enregistrement ?') && onDelete(record.id)} 
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
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
