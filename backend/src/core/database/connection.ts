import mongoose from 'mongoose';

interface ConnectionStatus {
  status: string;
  readyState: number;
  host: string | null;
  name: string | null;
}

/**
 * Conectar a MongoDB
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);

    // Eventos de MongoDB
    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB desconectado por cierre de aplicación');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', (error as Error).message);
    throw error;
  }
};

/**
 * Verificar conexión a MongoDB
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db?.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error verificando conexión MongoDB:', (error as Error).message);
    return false;
  }
};

/**
 * Obtener estado de la conexión
 */
export const getConnectionStatus = (): ConnectionStatus => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};
