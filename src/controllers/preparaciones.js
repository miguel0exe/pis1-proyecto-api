import conn from "../config/db.js";

export const preparacionesController = {
    getAll: async (req, res) => {
        try {
            const sql = "SELECT * FROM formas_preparacion";
            const [data] = await conn.execute(sql);
            res.json({
                status: true,
                message: "Formas de preparación obtenidas correctamente",
                data: data,
            });
        } catch (error) {
            console.error("Error al obtener las formas de preparación:", error);
            res.status(500).json({
                status: false,
                message: "Error al obtener las formas de preparación",
            });
        }
    },
};
