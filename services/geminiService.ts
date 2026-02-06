import { GoogleGenAI } from "@google/genai";
import { ProductionRecord } from "../types.ts";

export const analyzeProductionData = async (records: ProductionRecord[]) => {
  if (records.length === 0) return "Aucune donnée disponible pour l'analyse.";

  // Initialisation à chaque appel pour garantir la récupération de la clé si nécessaire
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const summary = records.slice(-10).map(r => 
    `- Lot ${r.lotNumber}: ${r.totalWeightKg}kg produit par ${r.employeeCount} employés, ${r.wasteKg}kg de pertes.`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un expert en gestion de production pour les Établissements Haddoud Moncef. Analyse ces données et donne 3 conseils stratégiques courts en français.\n\nDonnées :\n${summary}`,
      config: { temperature: 0.7 }
    });

    // Utilisation stricte de la propriété .text (et non de la méthode .text())
    return response.text || "Analyse indisponible.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Erreur d'analyse IA. Vérifiez votre connexion.";
  }
};