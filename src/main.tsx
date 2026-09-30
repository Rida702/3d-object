/**
 * @file main.tsx
 * @description Browser entry point. Loads global styles and mounts <App/> into #root.
 *   Nothing else belongs here — app composition lives in app/App.tsx.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/styles/tokens.css';
import '@/styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
