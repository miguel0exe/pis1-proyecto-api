// importar las rutas de los diferentes módulos
import { buscador } from "./buscador.js";
import { estados } from "./estados.js";
import { plantas } from "./plantas.js";
import { preparaciones } from "./preparaciones.js";
import { tipos } from "./tipos.js";

const api = "api/v1"; // Versión de la API

export const routes = (app) => {
    app.use(`/${api}/estados`, estados); // Define la ruta para estados
    app.use(`/${api}/plantas`, plantas); // Define la ruta para plantas
    app.use(`/${api}/tipos`, tipos); // Define la ruta para tipos
    app.use(`/${api}/preparaciones`, preparaciones); // Define la ruta para preparaciones
    app.use(`/${api}/buscador`, buscador); // Define la ruta para el buscador
};
