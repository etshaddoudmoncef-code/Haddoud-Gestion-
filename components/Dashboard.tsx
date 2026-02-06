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

  const chartData = useMemo(() => {
    const last7 = records.slice(-7).map(r => ({ name: r.date.split('-')[2], val: r.totalWeightKg }));
    return last7;
  }, [records]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Performance du jour</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Production Totale</p>
              <p className="text-3xl font-black">{metrics.kg} <span className="text-xs font-normal opacity-40">Kg</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Effectif Actif</p>
              <p className="text-3xl font-black text-blue-400">{metrics.emp} <span className="text-xs font-normal opacity-40">Pers.</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Rendement/Pers.</p>
              <p className="text-3xl font-black">{metrics.yield} <span className="text-xs font-normal opacity-40">Kg</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase text-red-400">Pertes cumulées</p>
              <p className="text-3xl font-black text-red-500">{metrics.waste} <span className="text-xs font-normal opacity-40">Kg</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-72">
        <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Évolution (7 derniers lots)</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;