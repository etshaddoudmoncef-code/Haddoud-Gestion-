import { GoogleGenAI } from "@google/genai";
import { ProductionRecord } from "../types.ts";

export const analyzeProductionData = async (records: ProductionRecord[]) => {
  if (records.length === 0) return "Aucune donnée disponible pour l'analyse.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = records.slice(-10).map(r => 
    `- Lot ${r.lotNumber}: ${r.totalWeightKg}kg produit par ${r.employeeCount} employés, ${r.wasteKg}kg de pertes (${r.infestationRate}% infestation).`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse cette production agricole pour l'établissement Haddoud Moncef et donne 3 conseils stratégiques courts en français pour réduire les pertes et augmenter le rendement par employé.\n\nDonnées :\n${summary}`,
      config: { temperature: 0.7 }
    });

    return response.text || "Analyse indisponible.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Erreur lors de l'analyse IA.";
  }
};