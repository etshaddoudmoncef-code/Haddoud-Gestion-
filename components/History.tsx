import React from 'react';
import { ProductionRecord } from '../types.ts';

interface Props {
  records: ProductionRecord[];
  isAdmin: boolean;
  onEdit: (r: ProductionRecord) => void;
  onDelete: (id: string) => void;
}

const History: React.FC<Props> = ({ records, isAdmin, onEdit, onDelete }) => {
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3 pb-8">
      {sorted.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic bg-white rounded-[2rem] border border-dashed border-slate-300">
          Aucun historique de production.
        </div>
      ) : (
        sorted.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-slate-900 uppercase truncate">{r.clientName}</span>
                <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg font-black tracking-tight shrink-0">#{r.lotNumber}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mb-2">{r.productName} • {new Date(r.date).toLocaleDateString()}</p>
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400">Poids Net</span>
                  <span className="text-xs font-black text-blue-600">{r.totalWeightKg}kg</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400">Employés</span>
                  <span className="text-xs font-black text-slate-800">{r.employeeCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-red-400">Pertes</span>
                  <span className="text-xs font-black text-red-500">{r.wasteKg}kg</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button onClick={() => onEdit(r)} className="p-3 bg-slate-50 rounded-2xl text-lg hover:bg-amber-50 hover:text-amber-600 transition-colors">✏️</button>
              )}
              <button onClick={() => confirm('Supprimer ?') && onDelete(r.id)} className="p-3 bg-slate-50 rounded-2xl text-lg hover:bg-red-50 hover:text-red-500 transition-colors">🗑️</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default History;