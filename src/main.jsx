import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Registrar SW solo si es compatible y está servido desde origen correcto
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('Service Worker registrado correctamente'))
      .catch(err => console.error('Error registrando el SW:', err))
  })
}

// IndexedDB inicial
let db = window.indexedDB.open('database')
db.onupgradeneeded = event => {
  let result = event.target.result
  result.createObjectStore('table', { autoIncrement: true })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
