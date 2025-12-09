import { Router } from "express"; // Importa el enrutador de Express
import conn from "../config/db.js"; // Importa la conexión a la base de datos
import { plantasController } from "../controllers/plantas.js"; // Importa el controlador de plantas

const router = Router(); // Crea un enrutador de Express

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

// Definición de rutas para plantas medicinales usando el controlador plantasController
// GET -> recupera datos
// POST -> crea nuevos datos
// DELETE -> elimina datos
router.get("/", plantasController.getAll); // Obtener todas las plantas medicinales
router.post("/", plantasController.createNew); // Crear una nueva planta medicinal
router.get("/populares", plantasController.getMostViewed); // Obtener las plantas medicinales más vistas
router.get("/:id/imagen", plantasController.getImageById); // Obtener la imagen de una planta medicinal por ID
router.get("/:id", plantasController.getById); // Obtener una planta medicinal por ID
router.delete("/:id", plantasController.deleteById); // Eliminar una planta medicinal por ID

export { router as plantas }; // Exporta el enrutador para su uso en otras partes de la aplicación
