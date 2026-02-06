
import { GoogleGenAI } from "@google/genai";
import { ProductionRecord } from "../types.ts";

export const analyzeProductionData = async (records: ProductionRecord[]) => {
  if (records.length === 0) return "Aucune donnée disponible pour l'analyse pour le moment.";

  // Following Gemini SDK Guidelines: Initialization must use process.env.API_KEY directly in a named parameter.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = records.map(r => 
    `Date: ${r.date}, Client: ${r.clientName}, Produit: ${r.productName}, Employés: ${r.employeeCount}, Production: ${r.totalProduction} unités, Poids: ${r.totalWeightKg}kg, Déchets: ${r.wasteKg}kg, Taux d'infestation: ${r.infestationRate}%`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        En tant que consultant senior en gestion de production agricole, analysez ce journal de production et fournissez 3 à 4 conseils concrets et exploitables en français. 
        Concentrez-vous sur l'optimisation du rendement par employé (en kg), l'efficacité de l'emballage, le contrôle des infestations et surtout la RÉDUCTION DES DÉCHETS. 
        Comparez le ratio Déchets/Production par client et produit.
        Identifiez si certains clients ou produits sont associés à des taux de déchets anormalement élevés.
        
        Données :
        ${dataSummary}
      `,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Impossible de générer des analyses pour le moment.";
  } catch (error) {
    console.error("Erreur d'analyse IA:", error);
    return "Le consultant IA est actuellement indisponible ou la clé API est absente.";
  }
};
