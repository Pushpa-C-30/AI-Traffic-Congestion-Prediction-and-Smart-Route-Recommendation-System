import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const savedTheme = window.localStorage.getItem('traffiq-theme') || 'light';
document.body.classList.toggle('dark-mode', savedTheme === 'dark');
document.body.classList.toggle('light-mode', savedTheme !== 'dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
