import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config(); // Cargar variables de entorno

const conn = await mysql.createConnection({
    host: process.env.DB_HOST, // Dirección del servidor de la base de datos
    user: process.env.DB_USER, // Usuario de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña del usuario
    database: process.env.DB_NAME, // Nombre de la base de datos
});

export default conn;
