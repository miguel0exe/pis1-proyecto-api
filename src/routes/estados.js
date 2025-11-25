import { Router } from "express";
import { estadosController } from "../controllers/estados.js";

const router = Router();

router.get("/", estadosController.getAll);

export { router as estados };
