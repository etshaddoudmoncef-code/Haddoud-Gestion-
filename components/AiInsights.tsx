
import React, { useState, useEffect } from 'react';
import { ProductionRecord } from '../types.ts';
import { analyzeProductionData } from '../services/geminiService.ts';
import { ICONS } from '../constants.tsx';

interface AiInsightsProps {
  records: ProductionRecord[];
  isAdmin: boolean;
}

const AiInsights: React.FC<AiInsightsProps> = ({ records, isAdmin }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const triggerAnalysis = async () => {
    if (records.length === 0) return;
    setLoading(true);
    const result = await analyzeProductionData(records);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (records.length > 0 && !analysis) {
      triggerAnalysis();
    }
  }, [records]);

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl text-white shadow-xl ${isAdmin ? 'bg-gradient-to-br from-slate-800 to-slate-950' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl">
            <ICONS.Ai className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Conseils IA {isAdmin ? 'stratégiques' : 'opérationnels'}</h2>
            <p className="text-blue-100 text-[10px] opacity-70">
              {isAdmin ? "Analyse de la performance globale de l'équipe" : "Optimisation de votre production personnelle"}
            </p>
          </div>
        </div>

        {records.length < 2 ? (
          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-xs">
            Ajoutez au moins 2 rapports pour générer une analyse intelligente.
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-[10px] animate-pulse">L'intelligence artificielle travaille...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="whitespace-pre-wrap text-blue-50 leading-relaxed text-xs">
              {analysis || "Prêt pour l'analyse."}
            </div>
            <button 
              onClick={triggerAnalysis}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-[10px] transition-all flex justify-center items-center gap-2 mt-4"
            >
              Recalculer l'analyse
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-black text-slate-800 uppercase mb-2">Note de confidentialité</h4>
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          {isAdmin 
            ? "En tant qu'administrateur, vous voyez les données de tous les opérateurs. Vos conseils IA incluent les tendances de toute l'équipe."
            : "En tant qu'opérateur, vous ne voyez que vos propres données. Vos statistiques ne sont visibles que par vous et l'administrateur."}
        </p>
      </div>
    </div>
  );
};

export default AiInsights;
