import app from "./index.js";

const port = process.env.PORT || 3000; // Puerto definido en .env o 3000 por defecto

app.listen(port, "0.0.0.0", () => {
    // Iniciar el servidor
    console.log(`Server en puerto ${port}`);
});
