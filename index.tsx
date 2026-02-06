import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Point d'entrée robuste. 
 * On capture le rendu pour éviter les blocages silencieux sur Android.
 */
const startApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Système de gestion démarré.");
  } catch (err) {
    console.error("Erreur au montage React:", err);
    const debug = document.getElementById('debug-error');
    if (debug) {
      debug.style.display = 'block';
      debug.innerHTML = "<b>Échec du rendu :</b> Une erreur système empêche l'affichage.";
    }
  }
};

startApp();