# API del Proyecto de Ingenieria de Software 1

## Pasos para levantar el proyecto

En la terminar o powershell ejecutar los siguientes comandos:

-   npm install
-   npm run dev

Utilizar las siguientes rutas para hacer las consultas:

### Enpoints para consultar la tabla Estados

`GET http://localhost:3000/api/v1/estados -> retorna los estados almacenados en la base de datos`

### Enpoints para consultar la tabla Tipo

`GET http://localhost:3000/api/v1/tipos -> retorna los tipos de plantas que hay en la base de datos`

### Enpoints para consultar la tabla Plantas

`GET http://localhost:3000/api/v1/plantas -> retorna las plantas que hay en la base de datos`

`POST http://localhost:3000/api/v1/plantas -> guarda la información de una planta en la base de datos`

`GET http://localhost:3000/api/v1/plantas/populares -> retorna las 5 plantas más populares`

`GET http://localhost:3000/api/v1/plantas/:id -> retorna la planta que coincide con el id que recibe por la url`

`GET http://localhost:3000/api/v1/plantas/:id/imagen -> retorna la imagen que esta almacenada en la base de datos`

### Enpoints para consultar la tabla Formas de preparacion

`GET http://localhost:3000/api/v1/preparaciones -> retorna los tipos de preparaciones que hay en la base de datos`
