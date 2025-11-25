import { Router } from "express";
import { upload } from "../config/multer.js";
import { plantasController } from "../controllers/plantas.js";

const router = Router();

router.get("/", plantasController.getAll);
router.get("/:id", plantasController.getById);
router.post("/", upload.single("imagen"), plantasController.createNew);

export { router as plantas };
