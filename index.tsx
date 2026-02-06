import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Application Haddoud Prod démarrée avec succès.");
  } catch (err) {
    console.error("Échec critique du rendu React:", err);
    rootElement.innerHTML = `
      <div style="padding:40px; text-align:center; font-family:system-ui; background:#f8fafc; min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
        <div style="background:white; padding:30px; border-radius:24px; box-shadow:0 10px 25px rgba(0,0,0,0.05); border:1px solid #e2e8f0; max-width:90%;">
          <div style="font-size:40px; margin-bottom:20px;">⚠️</div>
          <h2 style="color:#0f172a; margin:0 0 10px 0; font-weight:900; text-transform:uppercase; letter-spacing:-0.025em;">Erreur de chargement</h2>
          <p style="color:#64748b; font-size:14px; line-height:1.5; margin-bottom:24px;">L'application n'a pas pu s'initialiser correctement. Cela peut arriver après une mise à jour.</p>
          <button 
            onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" 
            style="background:#0f172a; color:white; border:none; padding:12px 24px; border-radius:12px; font-weight:bold; font-size:12px; cursor:pointer; text-transform:uppercase; letter-spacing:0.05em;"
          >
            Réinitialiser et recharger
          </button>
          <p style="font-size:10px; color:#cbd5e1; margin-top:20px; font-family:monospace;">${String(err)}</p>
        </div>
      </div>
    `;
  }
}