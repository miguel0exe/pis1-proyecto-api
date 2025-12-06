import conn from "../config/db.js";
import {
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
            "SELECT id, nombre_comun, nombre_cientifico, vistas, imagen FROM plantas";
        let data = [];
        try {
            data = await getInformacionListado(conn, sqlPlantas);
        } catch (error) {
            console.error("Error al obtener las plantas:", error);
            return res
                .status(500)
                .json(parseRespError("Error al obtener las plantas"));
        }

        res.json(
            parseRespOk(data, "Plantas medicinales obtenidas correctamente")
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
            tipo,
            distribucion,
            preparaciones,
        } = req.body ?? {};

        console.log({
            nombre_cientifico,
            nombre_comun,
            descripcion,
            efectos_secundarios,
            imagen,
            usos,
            tipo,
            distribucion,
            preparaciones,
        });

        if (
            nombre_cientifico == null ||
            nombre_comun == null ||
            descripcion == null ||
            usos == null ||
            imagen == null ||
            efectos_secundarios == null ||
            tipo == null ||
            distribucion == null ||
            preparaciones == null
        ) {
            return res
                .status(400)
                .json(
                    parseRespError(
                        "Faltan campos obligatorios para crear la planta medicinal"
                    )
                );
        }

        // parsear tipo, distribucion, preparaciones from JSON string to array
        const tiposArray = JSON.parse(tipo);
        const distribucionArray = JSON.parse(distribucion);
        const preparacionesArray = JSON.parse(preparaciones);

        try {
            const sqlInsertPlanta = `
                INSERT INTO plantas
                (nombre_cientifico, nombre_comun, descripcion, efectos_secundarios, imagen, usos, vistas)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            `;
            const [result] = await conn.execute(sqlInsertPlanta, [
                nombre_cientifico,
                nombre_comun,
                descripcion,
                efectos_secundarios,
                imagen,
                usos,
            ]);
            const plantaId = result.insertId;
            if (plantaId) {
                await insertRelacionesBatch(
                    conn,
                    plantaId,
                    tiposArray,
                    distribucionArray,
                    preparacionesArray
                );
            }

            res.status(201).json(
                parseRespOk(
                    { id: plantaId },
                    "Planta medicinal creada correctamente"
                )
            );
        } catch (error) {
            console.error("Error al crear la planta medicinal:", error);
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
        const { id } = req.params;
        const sqlPlanta = "SELECT imagen FROM plantas WHERE id = ?";
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
};
