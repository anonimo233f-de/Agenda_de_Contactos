import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { checkDbConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

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
    console.log('Modo Resiliente activo: Almacenamiento en memoria con datos demo de Admin y Usuario listo para usar.');
  }
});
