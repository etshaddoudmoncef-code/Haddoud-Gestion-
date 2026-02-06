import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erreur de rendu React:", error);
    const errorDisplay = document.getElementById('error-display');
    const errorText = document.getElementById('error-text');
    if (errorDisplay && errorText) {
      errorDisplay.style.display = 'block';
      errorText.textContent = "Erreur de démarrage: " + (error instanceof Error ? error.message : "Inconnue");
    }
  }
};

mountApp();
