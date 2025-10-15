import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import webpush from "web-push";

const app = express();
app.use(cors());
app.use(bodyParser.json());


// CLAVES VAPID 

const publicVapidKey = "BIFfnwJktLiHzU4hsToHUkjNoPia0L4XuEcIyt3m3PeTHxo9oCSKdgNSWeIP2RS37p5ulxnP0Twzt86hLt8PQuQ";
const privateVapidKey = "VYccipkuFENALikvb_Eb0Hs9dxKkEDFQxBpyXDtgq5w";

webpush.setVapidDetails(
  "mailto:saulv4583@gmail.com", 
  publicVapidKey,
  privateVapidKey
);


// Conexión con MongoDB Atlas

mongoose
  .connect(
    "mongodb+srv://Saul_ioT:1234@cluster0.fo4lgsw.mongodb.net/pwaDB?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));


// Esquemas y modelos

const RegistroSchema = new mongoose.Schema({
  nombre: String,
  fecha: { type: Date, default: Date.now },
});

const SubscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: Object,
});

const Registro = mongoose.model("Registro", RegistroSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);


// Endpoint para guardar datos

app.post("/api/save", async (req, res) => {
  const { nombre } = req.body;
  const nuevo = new Registro({ nombre });
  await nuevo.save();
  console.log("Registro guardado:", nuevo);
  res.status(201).json({ message: "Guardado correctamente", data: nuevo });
});


// Guardar suscripción push

app.post("/api/subscribe", async (req, res) => {
  const subscription = req.body;

  await Subscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    subscription,
    { upsert: true }
  );

  res.status(201).json({ message: "Suscripción guardada correctamente." });
});


// Enviar notificación push

app.post("/api/send-push", async (req, res) => {
  const { title, body } = req.body;

  const subs = await Subscription.find();
  const payload = JSON.stringify({ title, body });

  for (let sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("Error al enviar push:", err);
    }
  }

  res.json({ message: "Notificaciones enviadas" });
});


// Iniciar servidor

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
