import mongoose from 'mongoose';

const DEFAULT_DSN = 'mongodb+srv://niassy:niassy1903@denc_xaliss.hroxuxi.mongodb.net/denc_xaliss?retryWrites=true&w=majority&appName=denc_xaliss';

let isConnected = false;
let connectionError: string | null = null;

export async function connectDB(): Promise<typeof mongoose | null> {
  const dsn = process.env.DB_DSN || DEFAULT_DSN;
  const dbName = process.env.DB_DATABASE || 'denc_xaliss';

  if (isConnected) {
    return mongoose;
  }

  try {
    mongoose.set('strictQuery', false);
    console.log(`[Database] Connexion à MongoDB Atlas (${dbName})...`);
    
    // Connect with a reasonable serverSelectionTimeoutMS so server starts gracefully
    await mongoose.connect(dsn, {
      dbName,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    connectionError = null;
    console.log('[Database] ✅ Connecté avec succès à MongoDB Atlas');
    return mongoose;
  } catch (error: any) {
    console.error('[Database] ⚠️ Erreur de connexion MongoDB:', error.message || error);
    connectionError = error.message || 'Erreur de connexion MongoDB';
    return null;
  }
}

export function getDBStatus() {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState,
    error: connectionError,
  };
}
