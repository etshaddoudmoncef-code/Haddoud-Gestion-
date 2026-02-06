import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Point d'entrée de l'application.
 * Utilise createRoot de manière standard pour React 19.
 */
const startApp = () => {
  const container = document.getElementById('root');
  
  if (!container) {
    console.error("Erreur critique : Élément racine #root introuvable.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erreur lors du rendu initial :", error);
    const debugDiv = document.getElementById('debug-error');
    if (debugDiv) {
      debugDiv.style.display = 'block';
      debugDiv.innerHTML = `<b>Erreur de Rendu:</b> ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};

// Lancement de l'application
startApp();