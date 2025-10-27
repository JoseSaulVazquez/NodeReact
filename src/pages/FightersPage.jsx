import { useParams, Link } from "react-router-dom";
import fighters from "../data/fighters";
import "./FightersPage.css";

export default function FighterPage() {
  const { slug } = useParams();
  const fighter = fighters.find((f) => f.id === slug);

  if (!fighter) {
    return <p style={{ color: "white" }}>Luchador no encontrado.</p>;
  }

  return (
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

      <button className="subscribe-btn">
        🔔 Suscribirme a {fighter.name}
      </button>
    </div>
  );
}
