import { Router } from "express";
import { tiposController } from "../controllers/tipos.js";

const router = Router();

router.get("/", tiposController.getAll);

export { router as tipos };
