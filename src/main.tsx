import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const RELOAD_FLAG = 'sonnikai-reloaded-at';

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const last = Number(window.sessionStorage.getItem(RELOAD_FLAG) || 0);
  if (Date.now() - last < 20000) return;
  window.sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
