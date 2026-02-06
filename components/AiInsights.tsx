import React, { useState, useEffect } from 'react';
import { ProductionRecord } from '../types.ts';
import { analyzeProductionData } from '../services/geminiService.ts';

const AiInsights: React.FC<{ records: ProductionRecord[]; isAdmin: boolean }> = ({ records }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await analyzeProductionData(records);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (records.length >= 2 && !analysis) fetchAnalysis();
  }, [records]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl">✨</span>
            <h2 className="text-xl font-black tracking-tight">Conseils IA Stratégiques</h2>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Consultation en cours...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-blue-50">
                  {analysis || "Collectez plus de données pour débloquer l'analyse prédictive."}
                </p>
              </div>
              <button 
                onClick={fetchAnalysis}
                className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
              >
                Actualiser l'analyse
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm italic text-slate-500 text-[10px] text-center">
        L'IA analyse les tendances de vos lots pour optimiser vos marges opérationnelles.
      </div>
    </div>
  );
};

export default AiInsights;