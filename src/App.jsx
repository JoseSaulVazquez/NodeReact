import { useState, useEffect } from "react";
import { addData } from "./db.js";
import "./App.css";

function App() {


  const [count, setCount] = useState(0);

  // Clave pública del servidor (VAPID)
  const publicVapidKey = "BIFfnwJktLiHzU4hsToHUkjNoPia0L4XuEcIyt3m3PeTHxo9oCSKdgNSWeIP2RS37p5ulxnP0Twzt86hLt8PQuQ";

  // Notificaciones push
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        try {
          const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });

          await fetch("http://localhost:4000/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
          });

          console.log("Suscripción push registrada correctamente");
        } catch (err) {
          console.error("Error al suscribirse a push:", err);
        }
      });
    }
  }, []);

  const sendData = async () => {
    const payload = { nombre: "JOSE", count };

    try {
      const resp = await fetch("http://localhost:4000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Fallo en el POST");

      console.log("POST enviado correctamente");
    } catch (err) {
      console.log("Error en POST, guardando en IndexedDB...");
      await addData(payload);

      if ("serviceWorker" in navigator && "SyncManager" in window) {
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
        <p>Guarda y envía datos, incluso sin conexión.</p>
        <div className="buttons">
          <button className="send" onClick={sendData}>
            Enviar (count = {count})
          </button>
          <button className="plus" onClick={() => setCount(count + 1)}>+1</button>
        </div>
        <small>
          Si no hay conexión, se guarda en IndexedDB y se envía luego.
        </small>
      </div>
    </div>
  );
}

// Convierte la clave VAPID base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default App;
