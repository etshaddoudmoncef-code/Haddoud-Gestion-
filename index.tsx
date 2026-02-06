import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Lancement de l'application avec un filet de sécurité.
 */
const startApplication = () => {
  const container = document.getElementById('root');
  
  if (!container) {
    console.error("DOM Root introuvable.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Application Haddoud démarrée avec succès.");
  } catch (error) {
    console.error("Erreur de rendu React:", error);
    const debug = document.getElementById('debug-error');
    if (debug) {
      debug.style.display = 'block';
      debug.innerHTML = `<b>Erreur Système :</b> L'interface n'a pas pu être générée.<br>${error instanceof Error ? error.message : String(error)}`;
    }
  }
};

// On attend que le DOM soit totalement prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}