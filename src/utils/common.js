export const getInformacionAdicional = async (sqlQuery, conn, params = []) => {
    let planta = await getInformacionListado(conn, sqlQuery, params);

    if (planta.length === 0) {
        return null;
    }

    planta = planta[0];

    const sqlPreparaciones = `
        SELECT fp.id, fp.nombre, fp.descripcion, pp.parte_usada, pp.detalles
        FROM planta_preparacion pp
        JOIN formas_preparacion fp ON fp.id = pp.id_preparacion
        WHERE pp.id_planta = ?;
    `;
    const [preparaciones] = await conn.execute(sqlPreparaciones, [planta?.id]);

    return {
        ...planta,
        preparaciones: preparaciones,
    };
};

export const getInformacionListado = async (conn, sqlQuery, params = []) => {
    const [plantas] = await conn.execute(sqlQuery, params);
    const data = [];
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

        const planta = {
            ...pl,
            imagen: imagenUrl,
            tipo: tipos,
            distribucion: estados,
        };
        data.push(planta);
    }
    return data;
};
