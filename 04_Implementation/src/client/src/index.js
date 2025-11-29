// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode ช่วยเตือน Error ในระหว่าง Dev (อาจทำให้ useEffect รัน 2 รอบ เป็นปกติครับ)
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
