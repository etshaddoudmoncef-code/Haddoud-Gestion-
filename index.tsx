import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
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
  const display = document.getElementById('error-display');
  if (display) {
    display.innerText = "Erreur au démarrage : " + (error?.message || "Inconnue");
    display.style.display = 'block';
  }
}