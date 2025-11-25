import { estados } from "./estados.js";
import { plantas } from "./plantas.js";
import { tipos } from "./tipos.js";

const api = "api/v1";

export const routes = (app) => {
    app.use(`/${api}/estados`, estados);
    app.use(`/${api}/plantas`, plantas);
    app.use(`/${api}/tipos`, tipos);
};
