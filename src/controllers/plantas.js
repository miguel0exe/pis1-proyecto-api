import conn from "../config/db.js";

export const plantasController = {
    getAll: async (req, res) => {
        const sqlPlantas = "SELECT * FROM plantas";
        let data = [];
        try {
            const [plantas] = await conn.execute(sqlPlantas);

            for (let pl of plantas) {
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
                    tipo: tipos,
                    distribucion: estados,
                    preparaciones: preparaciones,
                };
                data.push(planta);
            }
        } catch (error) {
            console.error("Error al obtener las plantas:", error);
            return res.status(500).json({
                status: false,
                message: "Error al obtener las plantas",
            });
        }

        res.json({
            status: true,
            message: "Lista de plantas medicinales",
            data: data,
        });
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
                tipo: tipos,
                distribucion: estados,
                preparaciones: preparaciones,
            };
            res.json({
                status: true,
                message: "Planta medicinal encontrada",
                data: data,
            });
        } catch (error) {
            console.error("Error al obtener la planta:", error);
            return res.status(500).json({
                status: false,
                message: "Error al obtener la planta",
            });
        }
    },
    createNew: async (req, res) => {
        // Lógica para crear una nueva planta medicinal
        console.log(req.body);
        console.log(req.file);

        const {
            nombre_cientifico,
            nombre_comun,
            descripcion,
            efectos_secundarios,
            usos,
            tipo,
            distribucion,
            preparaciones,
        } = req.body;
        const imagen = req.file ? req.file.filename : null;
        // parser tipo, distribucion, preparaciones from JSON string to array
        const tiposArray = JSON.parse(tipo);
        const distribucionArray = JSON.parse(distribucion);
        const preparacionesArray = JSON.parse(preparaciones);
    },
};
