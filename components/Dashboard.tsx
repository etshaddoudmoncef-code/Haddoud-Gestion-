import React, { useMemo } from 'react';
import { ProductionRecord } from '../types.ts';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  records: ProductionRecord[];
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = useMemo(() => records.filter(r => r.date === today), [records, today]);

  const metrics = useMemo(() => {
    const totalKg = todayRecords.reduce((s, r) => s + (r.totalWeightKg || 0), 0);
    const totalEmp = todayRecords.reduce((s, r) => s + (r.employeeCount || 0), 0);
    const totalWaste = todayRecords.reduce((s, r) => s + (r.wasteKg || 0), 0);
    return { 
      kg: totalKg.toLocaleString(), 
      emp: totalEmp, 
      waste: totalWaste.toLocaleString(),
      yield: totalEmp > 0 ? (totalKg / totalEmp).toFixed(1) : '0'
    };
  }, [todayRecords]);

  // Données de graphique simplifiées
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [{ name: '-', val: 0 }];
    return records.slice(-7).map(r => ({ 
      name: r.date.split('-').pop() || '', 
      val: r.totalWeightKg || 0 
    }));
  }, [records]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Production Journalière</p>
              <h2 className="text-4xl font-black">{metrics.kg} <span className="text-sm font-normal opacity-40">Kg</span></h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Effectif Total</p>
              <h3 className="text-3xl font-black text-white">{metrics.emp} <span className="text-xs font-normal opacity-40">Pers.</span></h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Rendement Moyen</p>
              <p className="text-xl font-black text-emerald-400">{metrics.yield} <span className="text-[10px] font-normal opacity-60">kg/p</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Pertes du jour</p>
              <p className="text-xl font-black text-red-500">{metrics.waste} <span className="text-[10px] font-normal opacity-60">kg</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Évolution (7 jours)</p>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
              <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;