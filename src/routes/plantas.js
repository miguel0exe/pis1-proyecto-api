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
    const buffer = convertBase64ToBuffer(base64Data);

    const sql = `
        UPDATE plantas
        SET imagen = ?
        WHERE id = ?;
    `;
    // cast id a number
    conn.execute(sql, [buffer, Number(id)]);
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
router.delete("/:id", plantasController.deleteById);

export { router as plantas };
