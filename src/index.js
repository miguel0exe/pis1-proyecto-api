import cors from "cors";
import dotevn from "dotenv";
import express from "express";
import { routes } from "./routes/index.js";

dotevn.config(); // Cargar variables de entorno

const app = express(); // Crear instancia de Express

app.use(cors()); // Habilitar CORS (permitir solicitudes desde otros dominios)
app.use(express.json({ limit: "16mb" })); // Middleware para parsear JSON con un límite de tamaño
app.use(express.urlencoded({ extended: true, limit: "16mb" })); // Middleware para parsear datos URL-encoded con un límite de tamaño

routes(app); // Configurar rutas

export default app;

//  192.168.3.57
