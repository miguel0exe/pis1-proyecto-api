import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config(); // Cargar variables de entorno

const conn = await mysql.createConnection({
    host: process.env.DB_HOST, // Dirección del servidor de la base de datos
    user: process.env.DB_USER, // Usuario de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña del usuario
    database: process.env.DB_NAME, // Nombre de la base de datos
});

const createTables = async () => {
    const plantasTable = `
    CREATE TABLE plantas (
        id INT NOT NULL AUTO_INCREMENT,
        nombre_comun VARCHAR(150) NOT NULL,
        nombre_cientifico VARCHAR(150) NOT NULL,
        descripcion TEXT NOT NULL,
        imagen VARCHAR(150) NOT NULL,
        efectos_secundarios TEXT,
        usos TEXT NOT NULL,
        vistas INT,
        PRIMARY KEY (id)
    ) ENGINE = InnoDB;
    `;

    const createIndex = `CREATE INDEX idx_planta_nombre_comun ON plantas(nombre_comun); `;
    const createIndex2 = `CREATE INDEX idx_planta_nombre_cientifico ON plantas(nombre_cientifico);`;

    const tiposTable = `
    CREATE TABLE tipo (
        id INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (nombre)
    ) ENGINE = InnoDB;
    `;

    const planta_tipoTable = `
    CREATE TABLE planta_tipo (
        id_planta INT NOT NULL,
        id_tipo INT NOT NULL,
        PRIMARY KEY (id_planta, id_tipo),
        FOREIGN KEY (id_planta) REFERENCES plantas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_tipo) REFERENCES tipo(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = InnoDB;
    `;

    const estadosTable = `
    CREATE TABLE estados (
        id INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (nombre)
    ) ENGINE = InnoDB;
    `;

    const planta_estadoTable = `
    CREATE TABLE planta_estado (
        id_planta INT NOT NULL,
        id_estado INT NOT NULL,
        PRIMARY KEY (id_planta, id_estado),
        FOREIGN KEY (id_planta) REFERENCES plantas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_estado) REFERENCES estados(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = InnoDB;
    `;

    const formas_preparacionTable = `
    CREATE TABLE formas_preparacion (
        id INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        PRIMARY KEY (id),
        UNIQUE KEY (nombre)
    ) ENGINE = InnoDB;
    `;

    const plata_preparacionTable = `
    CREATE TABLE planta_preparacion (
        id_planta INT NOT NULL,
        id_preparacion INT NOT NULL,
        parte_usada VARCHAR(150) NOT NULL,
        detalles TEXT,
        PRIMARY KEY (id_planta, id_preparacion),
        FOREIGN KEY (id_planta) REFERENCES plantas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_preparacion) REFERENCES formas_preparacion(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = InnoDB;
    `;

    try {
        // unir todas las consultas de creación de tablas
        await conn.execute(plantasTable);
        await conn.execute(tiposTable);
        await conn.execute(planta_tipoTable);
        await conn.execute(estadosTable);
        await conn.execute(planta_estadoTable);
        await conn.execute(formas_preparacionTable);
        await conn.execute(plata_preparacionTable);

        console.log("Tablas creadas o ya existen.");
    } catch (error) {
        console.error("Error al crear las tablas:", error);
    }
};

// await createTables();

export default conn;
