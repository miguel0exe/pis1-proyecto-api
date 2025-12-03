import { Router } from "express";
import { preparacionesController } from "../controllers/preparaciones.js";

const router = Router();

router.get("/", preparacionesController.getAll);

export { router as preparaciones };
