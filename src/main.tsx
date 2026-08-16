import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// 🛑 VigyanPrep Proctored CBT Environment — Anti-Malpractice & Self-XSS Protection
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log(
      '%c🛑 STOP!',
      'color: #ef4444; font-size: 56px; font-weight: 900; font-family: system-ui, -apple-system, sans-serif; text-shadow: 0 2px 10px rgba(239, 68, 68, 0.5);'
    );
    console.log(
      '%c⚠️ This is a browser developer tool.\n' +
      'If someone told you to copy-paste any code here to "hack" answers, unlock features, or bypass timers, IT IS A FRAUD and will expose your account.\n\n' +
      '🛡️ VigyanPrep Live Examination Portal is strictly proctored.\n' +
      'Attempting to execute scripts or modify memory inside this console constitutes an Examination Malpractice Violation.\n' +
      'Official Security Advisory: https://vigyanprep.com/security',
      'font-size: 15px; font-weight: 600; color: #f43f5e; line-height: 1.6; font-family: system-ui, -apple-system, sans-serif;'
    );
  }, 400);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
