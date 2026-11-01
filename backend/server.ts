import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './src/config/db.ts';
import apiV1Routes from './src/routes/index.ts';
import { User } from './src/models/User.model.ts';
import { seedDatabase } from './src/controllers/seed.controller.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middlewares
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck racine
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API REST Denc Xaalis SN (Épargne & Tontines)',
    version: '1.0.0',
    documentation: '/api/v1/health',
    database: getDBStatus(),
  });
});

// Routes API
app.use('/api/v1', apiV1Routes);
app.use('/api', apiV1Routes); // Alias de compatibilité

// Middleware de gestion d'erreur 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
});

async function start() {
  try {
    // Connexion MongoDB
    const db = await connectDB();
    if (db) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Backend] Base de données vide détectée. Seeding automatique initial...');
        await seedDatabase();
      }
    }
  } catch (err) {
    console.error('[Backend] Avertissement initialisation MongoDB:', err);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Serveur Backend Denc Xaalis en écoute sur le port ${PORT}`);
    console.log(`📡 URL API : http://localhost:${PORT}/api/v1`);
    console.log(`🌐 Client Frontend autorisé : ${CLIENT_URL}`);
    console.log(`====================================================`);
  });
}

start().catch((err) => {
  console.error('[Backend] Erreur fatale au démarrage:', err);
  process.exit(1);
});

export default app;
