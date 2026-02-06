
import React, { useMemo } from 'react';
import { ProductionRecord, PurchaseRecord } from '../types.ts';

interface LotTraceabilityProps {
  records: ProductionRecord[];
  purchases: PurchaseRecord[];
}

const LotTraceability: React.FC<LotTraceabilityProps> = ({ records, purchases }) => {
  const lotData = useMemo(() => {
    const lots: Record<string, {
      lotNumber: string,
      purchase?: PurchaseRecord,
      production: ProductionRecord[],
      totals: {
        purchasedKg: number,
        producedKg: number,
        wasteKg: number,
        infestationPurchase: number,
        infestationProdAvg: number
      }
    }> = {};

    // Collecter les achats
    purchases.forEach(p => {
      if (!lots[p.lotNumber]) {
        lots[p.lotNumber] = { lotNumber: p.lotNumber, production: [], totals: { purchasedKg: 0, producedKg: 0, wasteKg: 0, infestationPurchase: 0, infestationProdAvg: 0 } };
      }
      lots[p.lotNumber].purchase = p;
      lots[p.lotNumber].totals.purchasedKg += p.quantity;
      lots[p.lotNumber].totals.infestationPurchase = p.infestationRate;
    });

    // Collecter les records de production
    records.forEach(r => {
      if (!lots[r.lotNumber]) {
        lots[r.lotNumber] = { lotNumber: r.lotNumber, production: [], totals: { purchasedKg: 0, producedKg: 0, wasteKg: 0, infestationPurchase: 0, infestationProdAvg: 0 } };
      }
      lots[r.lotNumber].production.push(r);
      lots[r.lotNumber].totals.producedKg += r.totalWeightKg;
      lots[r.lotNumber].totals.wasteKg += r.wasteKg;
    });

    // Calculer les moyennes d'infestation en production
    Object.keys(lots).forEach(num => {
      const lot = lots[num];
      if (lot.production.length > 0) {
        const sumInf = lot.production.reduce((s, r) => s + r.infestationRate, 0);
        lot.totals.infestationProdAvg = sumInf / lot.production.length;
      }
    });

    return Object.values(lots).sort((a, b) => b.lotNumber.localeCompare(a.lotNumber));
  }, [records, purchases]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="px-2">
        <h2 className="text-xl font-black text-slate-900">Suivi des Lots</h2>
        <p className="text-xs text-slate-500">Analyse de traçabilité Entrée vs Sortie</p>
      </div>

      {lotData.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
          <p className="text-slate-400 text-sm italic">Aucun lot enregistré. Commencez par une réception d'achat.</p>
        </div>
      ) : (
        lotData.map(lot => {
          const yieldPercent = lot.totals.purchasedKg > 0 
            ? (lot.totals.producedKg / lot.totals.purchasedKg) * 100 
            : 0;
            
          return (
            <div key={lot.lotNumber} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Header Lot */}
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-[10px]">LOT</div>
                  <span className="text-sm font-black tracking-widest">{lot.lotNumber}</span>
                </div>
                {yieldPercent > 0 && (
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase opacity-60">Rendement Global</p>
                    <p className="text-xs font-black text-emerald-400">{yieldPercent.toFixed(1)}%</p>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Entrée (Achat) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400">Réception (Entrée)</span>
                  </div>
                  {lot.purchase ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-slate-800">{lot.purchase.itemName} <span className="text-[9px] text-emerald-600">({lot.purchase.variety})</span></p>
                        <p className="text-[10px] text-slate-500">{lot.purchase.supplierName} • {new Date(lot.purchase.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-700">{lot.purchase.quantity}kg</p>
                        <p className="text-[9px] font-bold text-slate-400">Infest: {lot.purchase.infestationRate}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 border-dashed p-3 rounded-2xl text-[10px] text-slate-400 italic text-center">
                      Données d'achat manquantes pour ce numéro de lot.
                    </div>
                  )}
                </div>

                {/* Sorties (Production) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400">Productions (Sorties)</span>
                  </div>
                  <div className="space-y-2">
                    {lot.production.length > 0 ? (
                      lot.production.map(prod => (
                        <div key={prod.id} className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-slate-800">{prod.clientName}</p>
                            <p className="text-[9px] text-slate-500">{new Date(prod.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-black text-blue-700">{prod.totalWeightKg}kg</p>
                            <p className="text-[8px] text-red-500 font-bold">Déchets: {prod.wasteKg}kg</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 border-dashed p-3 rounded-2xl text-[10px] text-slate-400 italic text-center">
                        Aucune production associée à ce lot.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Analyse */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-[7px] font-black uppercase text-slate-400 mb-0.5">Quantité Finie</p>
                    <p className="text-xs font-black text-slate-800">{lot.totals.producedKg}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[7px] font-black uppercase text-slate-400 mb-0.5">Total Déchets</p>
                    <p className="text-xs font-black text-red-600">{lot.totals.wasteKg}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[7px] font-black uppercase text-slate-400 mb-0.5">Écart Infest.</p>
                    <p className={`text-xs font-black ${lot.totals.infestationProdAvg > lot.totals.infestationPurchase ? 'text-red-500' : 'text-emerald-500'}`}>
                      {lot.totals.infestationProdAvg > lot.totals.infestationPurchase ? '+' : ''}
                      {(lot.totals.infestationProdAvg - lot.totals.infestationPurchase).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LotTraceability;
