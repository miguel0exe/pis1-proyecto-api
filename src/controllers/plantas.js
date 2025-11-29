import conn from "../config/db.js";
import {
    detectarMimeType,
    parseRespError,
    parseRespOk,
} from "../config/utils.js";
import { getInformacionListado } from "../utils/common.js";

export const plantasController = {
    getAll: async (req, res) => {
        const sqlPlantas =
            "SELECT id, nombre_comun, nombre_cientifico, imagen FROM plantas";
        let data = [];
        try {
            const [plantas] = await conn.execute(sqlPlantas);

            for (let pl of plantas) {
                const imagenUrl = pl.imagen ? `/plantas/${pl.id}/imagen` : null;
                const sqlTipos = `
                    SELECT t.id, t.nombre
                    FROM planta_tipo pt
                    JOIN tipo t ON t.id = pt.id_tipo
                    WHERE pt.id_planta = ?;
                `;

                const [tipos] = await conn.execute(sqlTipos, [pl.id]);

                const sqlEstados = `
                    SELECT e.id, e.nombre
                    FROM planta_estado pe
                    JOIN estados e ON e.id = pe.id_estado
                    WHERE pe.id_planta = ?;
                `;

                const [estados] = await conn.execute(sqlEstados, [pl.id]);

                const sqlPreparaciones = `
                    SELECT fp.id, fp.nombre, fp.descripcion, pp.parte_usada, pp.detalles
                    FROM planta_preparacion pp
                    JOIN formas_preparacion fp ON fp.id = pp.id_preparacion
                    WHERE pp.id_planta = ?;
                `;
                const [preparaciones] = await conn.execute(sqlPreparaciones, [
                    pl.id,
                ]);

                const planta = {
                    ...pl,
                    imagen: imagenUrl,
                    tipo: tipos,
                    distribucion: estados,
                };
                data.push(planta);
            }
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
            const [plantas] = await conn.execute(sqlPlanta, [id]);
            if (plantas.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "Planta medicinal no encontrada",
                });
            }

            const planta = plantas[0];
            const imagenUrl = planta.imagen
                ? `/plantas/${planta.id}/imagen`
                : null;
            const sqlUpdateViews = `UPDATE plantas SET vistas = vistas + 1 WHERE id = ?`;
            await conn.execute(sqlUpdateViews, [id]);

            const sqlTipos = `
                SELECT t.id, t.nombre
                FROM planta_tipo pt
                JOIN tipo t ON t.id = pt.id_tipo
                WHERE pt.id_planta = ?;
            `;

            const [tipos] = await conn.execute(sqlTipos, [planta.id]);
            const sqlEstados = `
                SELECT e.id, e.nombre
                FROM planta_estado pe
                JOIN estados e ON e.id = pe.id_estado
                WHERE pe.id_planta = ?;
            `;
            const [estados] = await conn.execute(sqlEstados, [planta.id]);
            const sqlPreparaciones = `
                SELECT fp.id, fp.nombre, fp.descripcion, pp.parte_usada, pp.detalles
                FROM planta_preparacion pp
                JOIN formas_preparacion fp ON fp.id = pp.id_preparacion
                WHERE pp.id_planta = ?;
            `;
            const [preparaciones] = await conn.execute(sqlPreparaciones, [
                planta.id,
            ]);
            const data = {
                ...planta,
                imagen: imagenUrl,
                tipo: tipos,
                distribucion: estados,
                preparaciones: preparaciones,
            };
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
        } = req?.body;
        // parsear tipo, distribucion, preparaciones from JSON string to array
        const tiposArray = JSON.parse(tipo);
        const distribucionArray = JSON.parse(distribucion);
        const preparacionesArray = JSON.parse(preparaciones);
        console.log({
            nombre_cientifico,
            nombre_comun,
            descripcion,
            efectos_secundarios,
            imagen,
            usos,
            tiposArray,
            distribucionArray,
            preparacionesArray,
        });

        try {
            const sqlInsertPlanta = `
                INSERT INTO plantas 
                (nombre_cientifico, nombre_comun, descripcion, efectos_secundarios, imagen, usos)
                VALUES (?, ?, ?, ?, ?, ?)
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
                for (let tipoId of tiposArray) {
                    const sqlInsertTipo = `
                        INSERT INTO planta_tipo (id_planta, id_tipo) VALUES (?, ?)
                    `;
                }
                for (let estadoId of distribucionArray) {
                    const sqlInsertEstado = `
                        INSERT INTO planta_estado (id_planta, id_estado) VALUES (?, ?)
                    `;
                }
                for (let preparacion of preparacionesArray) {
                    const sqlInsertPreparacion = `
                        INSERT INTO planta_preparacion (id_planta, id_preparacion, parte_usada, detalles) VALUES (?, ?, ?, ?)
                    `;
                }
            }
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
                "SELECT id, nombre_comun, nombre_cientifico, imagen FROM plantas ORDER BY vistas DESC LIMIT 4";
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
