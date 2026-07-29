import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { initMonitoring } from '@/monitoring';
import '@/styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

initMonitoring();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
