import conn from "../config/db.js";
import { getInformacionListado } from "../utils/common.js";
import { parseRespError, parseRespOk } from "../utils/index.js";

export const buscadorController = {
    search: async (req, res) => {
        const { query } = req.query;
        try {
            const sql = `SELECT * FROM planta where nombre_cientifico LIKE ?`;
            const planta = await getInformacionListado(sql, conn, [
                `%${query}%`,
            ]);
            if (!planta) {
                return res
                    .status(404)
                    .json(parseRespError("Planta no encontrada"));
            }
            return res.json(parseRespOk(planta));
        } catch (error) {
            console.log(error);
            res.status(500).json(parseRespError("Error al buscar la planta"));
        }
    },
};
