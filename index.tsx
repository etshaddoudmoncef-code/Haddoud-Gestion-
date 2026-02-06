import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    rootElement.innerHTML = `
      <div style="padding:20px; color:red; font-family:sans-serif;">
        <h2>Erreur de démarrage</h2>
        <p>${String(err)}</p>
        <button onclick="localStorage.clear(); location.reload();">Réinitialiser l'application</button>
      </div>
    `;
  }
}