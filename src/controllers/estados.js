import conn from "../config/db.js";
import { parseRespError, parseRespOk } from "../config/parser.js";

export const estadosController = {
    getAll: async (req, res) => {
        const sql = "SELECT * FROM estados";
        try {
            const [rows] = await conn.execute(sql);
            res.json(parseRespOk(rows, "Estados obtenidos"));
        } catch (error) {
            res.status(500).json(
                parseRespError("Error al obtener los estados")
            );
        }
    },
};
