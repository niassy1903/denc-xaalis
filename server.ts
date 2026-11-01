import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './backend/src/config/db.ts';
import apiV1Routes from './backend/src/routes/index.ts';
import { User } from './backend/src/models/User.model.ts';
import { seedDatabase } from './backend/src/controllers/seed.controller.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Middlewares essentiels
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialisation de la base de données MongoDB
  try {
    const db = await connectDB();
    if (db) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Server] Base vide détectée. Initialisation des données de démarrage...');
        await seedDatabase();
      }
    }
  } catch (dbErr) {
    console.error('[Server] Avertissement initialisation DB:', dbErr);
  }

  // Routes API
  app.use('/api/v1', apiV1Routes);
  app.use('/api', apiV1Routes); // Alias pour compatibilité

  // Vite middleware pour le développement ou fichiers statiques en production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Denc Xaalis] Serveur démarré avec succès sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erreur fatale au démarrage du serveur:', err);
});
