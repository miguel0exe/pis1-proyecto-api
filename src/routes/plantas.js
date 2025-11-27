import { Router } from "express";
import { upload } from "../config/multer.js";
import { plantasController } from "../controllers/plantas.js";

const router = Router();

router.get("/", plantasController.getAll);
router.post("/", upload.single("imagen"), plantasController.createNew);
router.get("/populares", plantasController.getMostViewed);
router.get("/:id", plantasController.getById);
export { router as plantas };
