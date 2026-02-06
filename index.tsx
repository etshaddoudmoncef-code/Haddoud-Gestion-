import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("BOOT: Phase 1 - Modules importés");

const container = document.getElementById('root');

if (container) {
  try {
    console.log("BOOT: Phase 2 - Montage React");
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("BOOT: Phase 3 - Succès");
  } catch (e) {
    console.error("BOOT: Erreur critique", e);
    const debug = document.getElementById('debug-error');
    if (debug) {
      debug.style.display = 'block';
      debug.innerHTML = `<p style="color:red; font-size:10px;">Erreur Fatale: ${String(e)}</p>`;
    }
  }
} else {
  console.error("BOOT: Container #root introuvable");
}