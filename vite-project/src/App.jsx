import { useState } from 'react'
import { addData } from './db.js'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const sendData = async () => {
    const payload = { nombre: "JOSE", count };

    try {
      // simula POST
      let resp = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Fallo en el POST");

      console.log("POST enviado correctamente");
    } catch (err) {
      console.log("Error en POST, guardando en IndexedDB...");
      await addData(payload);

      // Avisar al SW que intente reintentar luego
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        reg.sync.register("sync-posts");
      }
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={sendData}>
          count is {count}
        </button>
        <p>
          Si no hay conexión, guarda en IndexedDB y reintenta cuando vuelva.
        </p>
      </div>
    </>
  )
}

export default App
