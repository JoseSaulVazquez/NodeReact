import { useParams, Link } from "react-router-dom";
import fighters from "../data/fighters";
import "./FightersPage.css";

export default function FighterPage() {
  const { slug } = useParams();
  const fighter = fighters.find((f) => f.id === slug);

  if (!fighter) return <p style={{ color: "white" }}>Luchador no encontrado.</p>;

 // INDEXEDDB FAVORITOS
const saveFavorite = () => {
  const request = indexedDB.open("database", 1);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains("favorites")) {
      db.createObjectStore("favorites", { keyPath: "id" });
    }
  };

  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction("favorites", "readwrite");
    const store = tx.objectStore("favorites");
    store.put({ id: fighter.id, name: fighter.name });

    tx.oncomplete = () => {
      alert(`⭐ ${fighter.name} agregado a favoritos`);
    };
  };
};


  // SUSCRIBIRSE A PUSH
  const subscribeToFighter = async () => {
    const sw = await navigator.serviceWorker.ready;

    const subscription = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BIFfnwJktLiHzU4hsToHUkjNoPia0L4XuEcIyt3m3PeTHxo9oCSKdgNSWeIP2RS37p5ulxnP0Twzt86hLt8PQuQ"
    });

    await fetch("http://localhost:4000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription, luchador: fighter.name }),
    });

    alert(`🔔 Te suscribiste a ${fighter.name}`);
  };

  // CANCELAR SUSCRIPCIÓN 
  const unsubscribe = async () => {
    const sw = await navigator.serviceWorker.ready;
    const sub = await sw.pushManager.getSubscription();
    if (!sub) return alert("No estás suscrito");

    await fetch("http://localhost:4000/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    alert(`🔕 Cancelaste suscripción a ${fighter.name}`);
  };

  return (
    <div className="fighter-wrapper">

  <div className="fighter-container">
    <Link to="/" className="back-link">⬅ Volver</Link>

    <h1 className="fighter-name">{fighter.name}</h1>
    <img src={fighter.image} alt={fighter.name} className="fighter-img" />

    <p className="bio">{fighter.bio}</p>

    <h3>🏆 Logros destacados:</h3>
    <ul className="achievements">
      {fighter.achievements.map((a, i) => (
        <li key={i}>{a}</li>
      ))}
    </ul>

    <button className="subscribe-btn">🔔 Suscribirme a {fighter.name}</button>
    <button className="unsubscribe-btn">🔕 Cancelar suscripción</button>
    <button className="fav-btn">⭐ Agregar a favoritos</button>
  </div>

  {/* Fondo */}
  <div 
    className="fighter-bg"
    style={{ backgroundImage: `url(${fighter.image2})` }}
  />

</div>

  );
}
