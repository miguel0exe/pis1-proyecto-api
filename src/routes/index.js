import { estados } from "./estados.js";

const api = "/api/v1";
export const routes = (app) => {
    app.use(`${api}/estados`, estados); // Rutas para estados
};
