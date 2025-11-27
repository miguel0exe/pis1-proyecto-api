export const getInformacionCompleta = async (planta, conn) => {
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
    const [preparaciones] = await conn.execute(sqlPreparaciones, [planta.id]);

    return {
        ...planta,
        tipo: tipos,
        distribucion: estados,
        preparaciones: preparaciones,
    };
};
