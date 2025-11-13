import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { checkConnection, getConnectionStatus } from './core/database/connection';
import { errorHandler, notFound } from './core/middlewares/errorHandler.middleware';

// Rutas
import authRoutes from './features/auth/routes/auth.routes';
import usuariosRoutes from './features/usuarios/routes/usuarios.routes';
import equiposRoutes from './features/equipos/routes/equipos.routes';
import jugadoresRoutes from './features/jugadores/routes/jugadores.routes';
import torneosRoutes from './features/torneos/routes/torneos.routes';
import partidosRoutes from './features/partidos/routes/partidos.routes';

const app: Application = express();

// ========================================
// MIDDLEWARES DE SEGURIDAD
// ========================================

// Helmet - Seguridad HTTP headers
app.use(helmet());

// CORS - Configuración
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - Prevenir abuso
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ========================================
// MIDDLEWARES DE PARSING
// ========================================

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización contra NoSQL injection
app.use(mongoSanitize());

// ========================================
// LOGGING
// ========================================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbConnected = await checkConnection();
    const dbStatus = getConnectionStatus();

    const healthCheck = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbConnected,
        status: dbStatus.status,
        host: dbStatus.host,
        name: dbStatus.name,
      },
      memory: {
        usage: process.memoryUsage(),
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      },
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    });
  }
});

// ========================================
// RUTA DE BIENVENIDA
// ========================================

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🏆 API Torneo Vallejo',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      equipos: '/api/equipos',
      jugadores: '/api/jugadores',
      torneos: '/api/torneos',
      partidos: '/api/partidos',
    },
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// API ROUTES
// ========================================

const API_VERSION = '/api';

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/usuarios`, usuariosRoutes);
app.use(`${API_VERSION}/equipos`, equiposRoutes);
app.use(`${API_VERSION}/jugadores`, jugadoresRoutes);
app.use(`${API_VERSION}/torneos`, torneosRoutes);
app.use(`${API_VERSION}/partidos`, partidosRoutes);

// ========================================
// ERROR HANDLERS
// ========================================

// 404 - Ruta no encontrada
app.use(notFound);

// Error handler general
app.use(errorHandler);

export default app;
