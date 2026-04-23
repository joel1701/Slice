import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// StrictMode runs your components twice in development to catch bugs early
// it doesn't affect production builds
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);