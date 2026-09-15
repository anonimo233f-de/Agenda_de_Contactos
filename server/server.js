import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';
import { checkDbConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const port = process.env.PORT || 3001;
const host = '0.0.0.0';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check & status
app.get('/api/health', async (_request, response) => {
  const dbConnected = await checkDbConnection();
  response.json({
    status: 'ok',
    database: dbConnected ? 'postgresql' : 'in-memory (fallback)',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

// Servir frontend React compilado en producción
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (_req, res) => {
    res.send('API de Agenda de Contactos activa. Visita /api/health para verificar el estado.');
  });
}

// Manejo global de errores
app.use((error, _request, response, _next) => {
  void _next;
  console.error('Error del servidor:', error);
  response.status(error.status || 500).json({
    message: error.message || 'Error interno del servidor',
  });
});

// Iniciar servidor y verificar base de datos
app.listen(port, host, async () => {
  console.log(`\nServidor de Agenda de Contactos activo en: http://0.0.0.0:${port}`);
  console.log(`También disponible en http://localhost:${port}`);
  const hasPg = await checkDbConnection();
  if (hasPg) {
    console.log('Conexión a PostgreSQL establecida con éxito.');
  } else {
    console.log('Modo Resiliente activo: Almacenamiento en memoria listo para usar.');
  }
});
