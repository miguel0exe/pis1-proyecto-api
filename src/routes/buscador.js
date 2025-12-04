import { Router } from "express";
import { buscadorController } from "../controllers/buscador.js";

const router = Router();

router.get("/", buscadorController.search);

export { router as buscador };
