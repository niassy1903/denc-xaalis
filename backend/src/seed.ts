import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import { seedDatabase } from './controllers/seed.controller.ts';

dotenv.config();

async function runSeed() {
  console.log('====================================================');
  console.log('🌱 Démarrage manuel du Seeder Denc Xaalis SN...');
  console.log('====================================================');
  
  const db = await connectDB();
  if (!db) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  await seedDatabase();
  console.log('✅ Seeding terminé avec succès. Les comptes réels et tontines sont prêts.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Erreur fatale pendant le seeding:', err);
  process.exit(1);
});
