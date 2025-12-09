import conn from "../config/db.js";
import {
    convertBase64ToBuffer,
    getInformacionAdicional,
    getInformacionListado,
    insertRelacionesBatch,
} from "../utils/common.js";
import {
    detectarMimeType,
    parseRespError,
    parseRespOk,
} from "../utils/index.js";

export const plantasController = {
    getAll: async (req, res) => {
        const sqlPlantas =
            "SELECT id, nombre_comun, nombre_cientifico, vistas, imagen FROM plantas"; // Consulta las plantas guardadas en la base de datos
        let data = []; // Inicializa un arreglo para almacenar los datos de las plantas
        try {
            data = await getInformacionListado(conn, sqlPlantas); // Obtiene la información de plantas usando la función auxiliar
        } catch (error) {
            return res
                .status(500)
                .json(parseRespError("Error al obtener las plantas")); // Maneja errores y responde con un mensaje de error
        }

        res.json(
            parseRespOk(data, "Plantas medicinales obtenidas correctamente") // Responde con los datos obtenidos y un mensaje de éxito
        );
    },
    getById: async (req, res) => {
        // Lógica para obtener una planta medicinal por ID

        const { id } = req.params;
        const sqlPlanta = "SELECT * FROM plantas WHERE id = ?";
        try {
            const data = await getInformacionAdicional(sqlPlanta, conn, [id]);

            if (!data) {
                return res.status(404).json({
                    status: false,
                    message: "Planta medicinal no encontrada",
                });
            }

            const sqlUpdateViews = `UPDATE plantas SET vistas = vistas + 1 WHERE id = ?`;
            await conn.execute(sqlUpdateViews, [id]);

            res.json(
                parseRespOk(data, "Planta medicinal obtenida correctamente")
            );
        } catch (error) {
            console.error("Error al obtener la planta:", error);
            return res
                .status(500)
                .json(parseRespError("Error al obtener la planta"));
        }
    },
    createNew: async (req, res) => {
        // Lógica para crear una nueva planta medicinal
        const {
            nombre_cientifico,
            nombre_comun,
            descripcion,
            efectos_secundarios,
            imagen,
            usos,
            tipos,
            distribucion,
            preparaciones,
            password,
        } = req.body ?? {}; // Extrae los datos del cuerpo de la solicitud
        // Validar que todos los campos obligatorios estén presentes
        if (
            nombre_cientifico == null ||
            nombre_comun == null ||
            descripcion == null ||
            usos == null ||
            imagen == null ||
            efectos_secundarios == null ||
            tipos == null ||
            distribucion == null ||
            preparaciones == null ||
            password == null
        ) {
            return res
                .status(400)
                .json(
                    parseRespError(
                        "Faltan campos obligatorios para crear la planta medicinal"
                    )
                );
        }

        // Verificar la contraseña de administrador
        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).json(parseRespError("Acceso denegado"));
        }

        try {
            const sqlInsertPlanta = `
                INSERT INTO plantas
                (nombre_cientifico, nombre_comun, descripcion, efectos_secundarios, imagen, usos, vistas)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            `; // Consulta SQL para insertar una nueva planta medicinal
            const buffer = convertBase64ToBuffer(imagen);
            const [result] = await conn.execute(sqlInsertPlanta, [
                nombre_cientifico,
                nombre_comun,
                descripcion,
                efectos_secundarios,
                buffer,
                usos,
            ]); // Ejecuta la consulta de inserción
            const plantaId = result.insertId; // Obtiene el ID de la planta recién creada
            // Si la planta se creó correctamente, inserta las relaciones en las tablas intermedias
            if (plantaId) {
                await insertRelacionesBatch(
                    conn,
                    plantaId,
                    tipos,
                    distribucion,
                    preparaciones
                ); // Inserta las relaciones en las tablas intermedias
            }

            // Responde con un mensaje de éxito y el ID de la planta creada
            res.status(201).json(
                parseRespOk(
                    { id: plantaId },
                    "Planta medicinal creada correctamente"
                )
            );
        } catch (error) {
            // Maneja errores y responde con un mensaje de error
            return res
                .status(500)
                .json(parseRespError("Error al agregar la planta medicinal"));
        }
    },
    getMostViewed: async (req, res) => {
        try {
            const sqlPlantas =
                "SELECT id, nombre_comun, nombre_cientifico, vistas, imagen FROM plantas ORDER BY vistas DESC LIMIT 4";
            const data = await getInformacionListado(conn, sqlPlantas);
            res.json(
                parseRespOk(data, "Plantas más vistas obtenidas correctamente")
            );
        } catch (error) {
            console.error("Error al obtener las plantas más vistas:", error);
            return res
                .status(500)
                .json(
                    parseRespError("Error al obtener las plantas más vistas")
                );
        }
    },
    getImageById: async (req, res) => {
        const { id } = req.params; // Obtener el ID de la planta medicinal
        const sqlPlanta = "SELECT imagen FROM plantas WHERE id = ?"; // Consulta SQL para obtener la imagen de la planta medicinal
        try {
            const [plantas] = await conn.execute(sqlPlanta, [id]);
            if (plantas.length === 0 || !plantas[0].imagen) {
                return res.status(404).json({
                    status: false,
                    message: "Imagen no encontrada",
                });
            }
            const imagePath = plantas[0].imagen;
            const mime = detectarMimeType(imagePath);
            res.setHeader("Content-Type", mime);
            res.send(imagePath, { root: "." });
        } catch (error) {
            console.error("Error al obtener la imagen de la planta:", error);
            return res
                .status(500)
                .json(
                    parseRespError("Error al obtener la imagen de la planta")
                );
        }
    },
    deleteById: async (req, res) => {
        const { id } = req.params; // Obtener el ID de la planta medicinal a eliminar
        const { password } = req.body; // Obtener la contraseña del cuerpo de la solicitud
        // Verificar la contraseña de administrador
        if (password !== process.env.ADMIN_PASSWORD) {
            return res
                .status(403)
                .json(
                    parseRespError("No tiene permiso para eliminar esta planta")
                );
        }
        const sqlDelete = "DELETE FROM plantas WHERE id = ?"; // Consulta SQL para eliminar la planta medicinal
        try {
            const [result] = await conn.execute(sqlDelete, [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: false,
                    message: "Planta medicinal no encontrada",
                });
            }
            res.json(
                parseRespOk(null, "Planta medicinal eliminada correctamente")
            );
        } catch (error) {
            console.error("Error al eliminar la planta medicinal:", error);
            return res
                .status(500)
                .json(parseRespError("Error al eliminar la planta medicinal"));
        }
    },
};
