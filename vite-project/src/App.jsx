import { useState } from 'react'
import { addData } from './db.js'
import './style.css'

function App() {
  const [count, setCount] = useState(0)

  const sendData = async () => {
    const payload = { nombre: "JOSE", count };

    try {
      const resp = await fetch("http://localhost:4000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Fallo en el POST");

      console.log("POST enviado correctamente");
    } catch (err) {
      console.log("Error en POST, guardando en IndexedDB...");
      await addData(payload);

      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        reg.sync.register("sync-posts");
        console.log("Sincronización registrada (sync-posts)");
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Vite + React (PWA)</h1>
        <p>Guarda y envía datos fácilmente incluso sin conexión.</p>
        <div className="buttons">
          <button className="send" onClick={sendData}>
            Enviar (count = {count})
          </button>
          <button className="plus" onClick={() => setCount(count + 1)}>+1</button>
        </div>
        <small>Si no hay conexión, se guardará en IndexedDB y se enviará luego.</small>
      </div>
    </div>
  )
}

export default App
