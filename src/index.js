import cors from "cors";
import dotevn from "dotenv";
import express from "express";
import { routes } from "./routes/index.js";

dotevn.config(); // Cargar variables de entorno

const port = process.env.PORT || 3000; // Puerto definido en .env o 3000 por defecto
const app = express(); // Crear instancia de Express

app.use(cors()); // Habilitar CORS
app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos URL-encoded
routes(app); // Configurar rutas

app.listen(port, () => {
    // Iniciar el servidor
    console.log(`Server en puerto ${port}`);
});
