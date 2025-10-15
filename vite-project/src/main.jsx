import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

navigator.serviceWorker.register('/sw.js');

let db=window.indexedDB.open('database');
db.onupgradeneeded=event=>{
  let result=event.target.result;
  result.createObjectStore('table',{autoIncrement:true});
}



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)