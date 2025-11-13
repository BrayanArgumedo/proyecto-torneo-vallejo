import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './core/database/connection';

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Iniciar servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // Conectar a MongoDB
    await connectDB();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ================================');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📦 Entorno: ${NODE_ENV}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌐 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
      console.log('🚀 ================================');
      console.log('');
    });

    // Manejo de errores del servidor
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
      } else {
        console.error('❌ Error en el servidor:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        console.log('👋 Servidor cerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Iniciar servidor
startServer();
