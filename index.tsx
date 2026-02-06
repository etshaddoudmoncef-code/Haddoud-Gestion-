import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Initialisation simplifiée pour éviter les erreurs de modules sur Android WebView.
 */
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.info("Application initialisée.");
  } catch (err) {
    console.error("Échec du rendu React:", err);
    const debug = document.getElementById('debug-error');
    if (debug) {
      debug.style.display = 'block';
      debug.innerHTML = "<b>Erreur de rendu :</b> Le moteur JS n'a pas pu démarrer l'application.";
    }
  }
}