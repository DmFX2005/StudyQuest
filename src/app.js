import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
//importar las rutas
import authRoutes from './routes/auth.routes.js';
import vinculosRoutes from './routes/vinculos.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import menuRoutes from './routes/menu.routes.js';
import tareasRoutes from './routes/tareas.routes.js';
import tareaProfeRoutes  from './routes/tareasProfectrl.routes.js';
import recompensasRoutes from './routes/recompensas.routes.js';
import aulaRoutes from './routes/aula.routes.js';
import notificacionRoutes from './routes/notificaciones.routes.js';
import calendarioRoutes from './routes/calendario.routes.js';
import flashcardsRoutes from './routes/flashcards.routes.js';

const app= express();
app.use(express.json());

const corsOption ={
    origin: '*',
    methods: ['GET','POST','PUT','PATCH','DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOption));

// Configuración para poder acceder a la carpeta 'uploads'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// indicar las rutas a utilizar
app.use('/api/auth', authRoutes);
app.use('/api', vinculosRoutes);
app.use('/api', usuarioRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api', tareasRoutes);
app.use('/api', tareaProfeRoutes);
app.use('/api', recompensasRoutes);
app.use('/api', aulaRoutes);
app.use('/api', notificacionRoutes);
app.use('/api', calendarioRoutes);
app.use('/api', flashcardsRoutes);

app.use((req,resp,next) => {
    resp.status(404).json({
        message:'Endpoint not found'
    })
})

export default app;