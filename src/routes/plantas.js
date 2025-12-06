import { Router } from "express";
import conn from "../config/db.js";
import { plantasController } from "../controllers/plantas.js";

const router = Router();

// ruta temporal para actualizar imagenes

router.put("/:id/imagenes", (req, res) => {
    const { id } = req.params;
    const file = req?.files;
    let base64Data = req.body?.imagen;
    // Si viene con el prefijo "data:image/jpeg;base64,..."
    if (base64Data.startsWith("data:")) {
        base64Data = base64Data.split(",")[1];
    }
    const buffer = Buffer.from(base64Data, "base64");

    const sql = `
        UPDATE plantas
        SET imagen = ?
        WHERE id = ?;
    `;
    conn.execute(sql, [buffer, id]);
    res.json({
        status: true,
        message: "Imagen actualizada correctamente",
    });
});

router.get("/", plantasController.getAll);
router.post("/", plantasController.createNew);
router.get("/populares", plantasController.getMostViewed);
router.get("/:id/imagen", plantasController.getImageById);
router.get("/:id", plantasController.getById);

export { router as plantas };
