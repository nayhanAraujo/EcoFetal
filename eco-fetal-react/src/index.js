import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';          // se você configurou Tailwind
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);