import conn from "../config/db.js";
import { parseRespError, parseRespOk } from "../utils/index.js";

export const tiposController = {
    getAll: async (req, res) => {
        const sql = "SELECT * FROM tipo";
        try {
            const [rows] = await conn.execute(sql);
            res.json(parseRespOk(rows, "Tipos obtenidos"));
        } catch (error) {
            res.status(500).json(parseRespError("Error al obtener los tipos"));
        }
    },
};
