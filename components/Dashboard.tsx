
import React, { useMemo } from 'react';
import { ProductionRecord, YieldMetrics } from '../types.ts';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  records: ProductionRecord[];
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ records, isAdmin }) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrage des données temporelles
  const todayRecords = useMemo(() => records.filter(r => r.date === todayStr), [records, todayStr]);
  const yesterdayRecords = useMemo(() => records.filter(r => r.date === yesterdayStr), [records, yesterdayStr]);
  const monthlyRecords = useMemo(() => records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [records, currentMonth, currentYear]);

  // Métriques spécifiques au jour J
  const todayMetrics = useMemo(() => {
    const totalKg = todayRecords.reduce((sum, r) => sum + (r.totalWeightKg || 0), 0);
    const totalEmp = todayRecords.reduce((sum, r) => sum + (r.employeeCount || 0), 0);
    const totalWaste = todayRecords.reduce((sum, r) => sum + (r.wasteKg || 0), 0);
    return { totalKg, totalEmp, totalWaste, yield: totalEmp > 0 ? totalKg / totalEmp : 0 };
  }, [todayRecords]);

  const yesterdayKg = useMemo(() => yesterdayRecords.reduce((sum, r) => sum + (r.totalWeightKg || 0), 0), [yesterdayRecords]);

  // Métriques cumulées du mois
  const metrics = useMemo<YieldMetrics>(() => {
    if (monthlyRecords.length === 0) return { totalOutput: 0, totalWeight: 0, totalWaste: 0, avgYield: 0, avgWeightYield: 0, avgInfestation: 0, totalEmployees: 0, avgEmployees: 0 };
    
    const totalOutput = monthlyRecords.reduce((sum, r) => sum + r.totalProduction, 0);
    const totalWeight = monthlyRecords.reduce((sum, r) => sum + (r.totalWeightKg || 0), 0);
    const totalWaste = monthlyRecords.reduce((sum, r) => sum + (r.wasteKg || 0), 0);
    const totalEmployees = monthlyRecords.reduce((sum, r) => sum + r.employeeCount, 0);
    const avgInfestation = monthlyRecords.reduce((sum, r) => sum + r.infestationRate, 0) / monthlyRecords.length;
    
    return {
      totalOutput,
      totalWeight,
      totalWaste,
      totalEmployees,
      avgYield: totalOutput / (totalEmployees || 1),
      avgWeightYield: totalWeight / (totalEmployees || 1),
      avgInfestation,
      avgEmployees: totalEmployees / (monthlyRecords.length || 1)
    };
  }, [monthlyRecords]);

  const clientSummary = useMemo(() => {
    const summary: Record<string, {
      count: number,
      totalKg: number,
      totalWaste: number,
      totalEmp: number,
      totalInf: number
    }> = {};

    monthlyRecords.forEach(r => {
      if (!summary[r.clientName]) {
        summary[r.clientName] = { count: 0, totalKg: 0, totalWaste: 0, totalEmp: 0, totalInf: 0 };
      }
      summary[r.clientName].count++;
      summary[r.clientName].totalKg += r.totalWeightKg;
      summary[r.clientName].totalWaste += r.wasteKg;
      summary[r.clientName].totalEmp += r.employeeCount;
      summary[r.clientName].totalInf += r.infestationRate;
    });

    return Object.entries(summary).map(([name, data]) => ({
      name,
      yieldPerEmp: data.totalKg / (data.totalEmp || 1),
      avgInf: data.totalInf / data.count,
      avgWaste: data.totalWaste / data.count,
      totalKg: data.totalKg
    })).sort((a, b) => b.totalKg - a.totalKg);
  }, [monthlyRecords]);

  return (
    <div className="space-y-6">
      {/* BILAN DU JOUR - Priorité Android UX */}
      <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Suivi Quotidien</h2>
              <p className="text-xl font-bold capitalize">{now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30 text-[9px] font-black uppercase">Direct</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Production (Kg)</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-black">{todayMetrics.totalKg.toLocaleString()}</p>
                {todayMetrics.totalKg > 0 && (
                  <span className={`text-xs font-bold ${todayMetrics.totalKg >= yesterdayKg ? 'text-emerald-400' : 'text-red-400'}`}>
                    {todayMetrics.totalKg >= yesterdayKg ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Effectif Actif</p>
              <p className="text-3xl font-black text-blue-400">{todayMetrics.totalEmp} <span className="text-xs font-normal opacity-40">Pers.</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Rendement/Pers.</p>
              <p className="text-2xl font-black">{todayMetrics.yield.toFixed(1)} <span className="text-xs font-normal opacity-40">Kg</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Pertes Jour</p>
              <p className={`text-2xl font-black ${todayMetrics.totalWaste > 0 ? 'text-red-400' : 'text-slate-500'}`}>{todayMetrics.totalWaste.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIQUES MENSUELLES - Vue secondaire */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Mois</p>
          <p className="text-2xl font-black text-slate-900">{metrics.totalWeight.toLocaleString()} <span className="text-xs font-normal text-slate-400">Kg</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-red-600 uppercase mb-1 opacity-70">Pertes Mois</p>
          <p className="text-2xl font-black text-red-600">{metrics.totalWaste.toLocaleString()} <span className="text-xs font-normal text-red-300">Kg</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rend. Moyen</p>
          <p className="text-2xl font-black text-slate-900">{metrics.avgWeightYield.toFixed(1)} <span className="text-xs font-normal text-slate-400">Kg</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Qualité Moy.</p>
          <p className={`text-2xl font-black ${metrics.avgInfestation > 5 ? 'text-red-500' : 'text-emerald-600'}`}>
            {(100 - metrics.avgInfestation).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique Evolution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-72">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Activité des 10 derniers jours</h3>
          {records.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records.slice(-10).map(r => ({ name: r.date.split('-')[2], prod: r.totalWeightKg }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="prod" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">En attente de données...</div>
          )}
        </div>

        {/* Top Clients */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Part de Production</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
            {clientSummary.length === 0 ? (
              <div className="text-center py-8 text-[10px] text-slate-400 italic bg-white rounded-3xl border border-slate-100">Aucun historique.</div>
            ) : (
              clientSummary.map(client => (
                <div key={client.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-800 truncate pr-2">{client.name}</span>
                    <span className="text-[10px] font-black text-blue-600 whitespace-nowrap">{client.totalKg.toLocaleString()} Kg</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (client.totalKg / (metrics.totalWeight || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
