import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión con MongoDB
mongoose
  .connect("mongodb+srv://Saul_ioT:1234@cluster0.fo4lgsw.mongodb.net/pwaDB?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// Definir esquema y modelo
const RegistroSchema = new mongoose.Schema({
  nombre: String,
  fecha: { type: Date, default: Date.now },
});

const Registro = mongoose.model("Registro", RegistroSchema);

// Endpoint para guardar datos
app.post("/api/save", async (req, res) => {
  const { nombre } = req.body;
  const nuevo = new Registro({ nombre });
  await nuevo.save();
  console.log("Registro guardado:", nuevo);
  res.status(201).json({ message: "Guardado correctamente", data: nuevo });
});


// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
