import express from 'express';
import { estadosController } from '../controllers/estados.js';

const app = express();

app.get('/', estadosController.getAll);

export { app as estados};