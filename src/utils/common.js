export const getInformacionAdicional = async (sqlQuery, conn, params = []) => {
    // 1. OBTENER PLANTA BASE (incluye todos los campos como descripcion, usos, etc., gracias a SELECT *)
    const [plantaBase] = await conn.execute(sqlQuery, params);

    if (plantaBase.length === 0) {
        return null;
    }

    const planta = plantaBase[0];

    // Obtener el ID de la planta para las consultas de relación
    const plantaId = planta.id;

    // 2. OBTENER PREPARACIONES
    const sqlPreparaciones = `
        SELECT fp.id, fp.nombre, fp.descripcion, pp.parte_usada, pp.detalles
        FROM planta_preparacion pp
        JOIN formas_preparacion fp ON fp.id = pp.id_preparacion
        WHERE pp.id_planta = ?;
    `;
    const [preparaciones] = await conn.execute(sqlPreparaciones, [plantaId]);

    // 3. OBTENER TIPOS
    const sqlTipos = `
        SELECT t.id, t.nombre
        FROM planta_tipo pt
        JOIN tipo t ON t.id = pt.id_tipo
        WHERE pt.id_planta = ?;
    `;
    const [tipos] = await conn.execute(sqlTipos, [plantaId]);

    // 4. OBTENER ESTADOS (Distribución)
    const sqlEstados = `
        SELECT e.id, e.nombre
        FROM planta_estado pe
        JOIN estados e ON e.id = pe.id_estado
        WHERE pe.id_planta = ?;
    `;
    const [estados] = await conn.execute(sqlEstados, [plantaId]);

    // Calcular la URL de la imagen (manteniendo la lógica original)
    const imagenUrl = planta.imagen ? `/plantas/${plantaId}/imagen` : null;

    // Devolver la planta con todos los datos de relación
    return {
        // Devuelve todos los campos de la tabla 'plantas' (descripcion, usos, efectos, etc.)
        ...planta,
        imagen: imagenUrl,
        tipo: tipos,
        distribucion: estados, // Usando el mismo nombre de clave que en getInformacionListado
        preparaciones: preparaciones,
    };
};

export const getInformacionListado = async (conn, sqlQuery, params = []) => {
    const [plantasBase] = await conn.execute(sqlQuery, params);

    if (plantasBase.length === 0) {
        return [];
    }

    const plantaIds = plantasBase.map((pl) => pl.id);
    const placeholders = plantaIds.map(() => "?").join(", "); // Genera ?, ?, ?

    // 2. OBTENER TODOS LOS TIPOS PARA TODAS LAS PLANTAS (2da consulta)
    const sqlTipos = `
        SELECT pt.id_planta, t.id, t.nombre
        FROM planta_tipo pt
        JOIN tipo t ON t.id = pt.id_tipo
        WHERE pt.id_planta IN (${placeholders});
    `;
    const [tiposRelacion] = await conn.execute(sqlTipos, plantaIds);

    // 3. OBTENER TODOS LOS ESTADOS PARA TODAS LAS PLANTAS (3ra consulta)
    const sqlEstados = `
        SELECT pe.id_planta, e.id, e.nombre
        FROM planta_estado pe
        JOIN estados e ON e.id = pe.id_estado
        WHERE pe.id_planta IN (${placeholders});
    `;
    const [estadosRelacion] = await conn.execute(sqlEstados, plantaIds);

    // --- Mapeo y Construcción de la Estructura JSON ---

    // Crear mapas para acceso rápido (O(1)) a los datos de relación
    const tiposMap = {};
    const estadosMap = {};

    tiposRelacion.forEach((rel) => {
        if (!tiposMap[rel.id_planta]) {
            tiposMap[rel.id_planta] = [];
        }
        tiposMap[rel.id_planta].push({ id: rel.id, nombre: rel.nombre });
    });

    estadosRelacion.forEach((rel) => {
        if (!estadosMap[rel.id_planta]) {
            estadosMap[rel.id_planta] = [];
        }
        estadosMap[rel.id_planta].push({ id: rel.id, nombre: rel.nombre });
    });

    // Construir la estructura final de datos
    const data = plantasBase.map((pl) => {
        const imagenUrl = pl.imagen ? `/plantas/${pl.id}/imagen` : null;

        return {
            ...pl,
            imagen: imagenUrl,
            tipo: tiposMap[pl.id] || [], // Asigna lista de tipos, si no hay, asigna []
            distribucion: estadosMap[pl.id] || [], // Asigna lista de estados, si no hay, asigna []
        };
    });

    return data;
};

export const insertRelacionesBatch = async (
    conn,
    plantaId,
    tiposArray,
    distribucionArray,
    preparacionesArray
) => {
    const connection = conn;

    // 1. Inserción de Tipos (Batch Insert)
    if (tiposArray.length > 0) {
        // Crea los placeholders y los valores: (plantaId, tipoId), (plantaId, tipoId)...
        const tipoPlaceholders = tiposArray.map(() => "(?, ?)").join(", ");
        const tipoValues = tiposArray.flatMap((tipoId) => [plantaId, tipoId]);

        const sqlInsertTipos = `INSERT INTO planta_tipo (id_planta, id_tipo) VALUES ${tipoPlaceholders}`;
        await connection.execute(sqlInsertTipos, tipoValues);
    }

    // 2. Inserción de Estados (Batch Insert)
    if (distribucionArray.length > 0) {
        const estadoPlaceholders = distribucionArray
            .map(() => "(?, ?)")
            .join(", ");
        const estadoValues = distribucionArray.flatMap((estadoId) => [
            plantaId,
            estadoId,
        ]);

        const sqlInsertEstados = `INSERT INTO planta_estado (id_planta, id_estado) VALUES ${estadoPlaceholders}`;
        await connection.execute(sqlInsertEstados, estadoValues);
    }

    // 3. Inserción de Preparaciones (Batch Insert)
    if (preparacionesArray.length > 0) {
        // Necesita 4 placeholders: (id_planta, id_preparacion, parte_usada, detalles)
        const prepPlaceholders = preparacionesArray
            .map(() => "(?, ?, ?, ?)")
            .join(", ");
        const prepValues = preparacionesArray.flatMap((prep) => [
            plantaId,
            prep.id_preparacion,
            prep.parte_usada,
            prep.detalles,
        ]);

        const sqlInsertPreps = `INSERT INTO planta_preparacion (id_planta, id_preparacion, parte_usada, detalles) VALUES ${prepPlaceholders}`;
        await connection.execute(sqlInsertPreps, prepValues);
    }
};

export const convertBase64ToBuffer = (base64String) => {
    let base64Data = base64String;
    // Si viene con el prefijo "data:image/jpeg;base64,..."
    if (base64Data.startsWith("data:")) {
        base64Data = base64Data.split(",")[1];
    }
    return Buffer.from(base64Data, "base64");
};
