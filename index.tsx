import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
const errorDisplay = document.getElementById('error-display');
const errorText = document.getElementById('error-text');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  console.error("Startup Error:", error);
  if (errorDisplay && errorText) {
    errorDisplay.style.display = 'block';
    errorText.innerText = error?.message || "Erreur de chargement des composants. Vérifiez votre connexion internet.";
  }
}

// Global error handler for module loading
window.addEventListener('error', (e) => {
  if (e.message.includes('Script error') || e.message.includes('Importing')) {
    if (errorDisplay && errorText) {
      errorDisplay.style.display = 'block';
      errorText.innerText = "Erreur de module : " + e.message;
    }
  }
}, true);