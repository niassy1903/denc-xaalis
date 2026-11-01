# 🏦 Denc Xaalis - Backend API REST

API REST Express.js & MongoDB pour la gestion des tontines, cotisations Wave/Orange Money, tours de rôle et back-office d'arbitrage.

## 🚀 Démarrage rapide

```bash
# 1. Installation des dépendances
npm install

# 2. Configuration des variables d'environnement
cp .env.example .env

# 3. Lancement en mode développement
npm run dev

# 4. Lancement en production
npm start # ou node server.ts
```

## 📋 Endpoints principaux

- `GET  /api/v1/health` : État de santé du serveur et statut MongoDB
- `POST /api/v1/auth/register` : Création de compte membre / président
- `POST /api/v1/auth/login` : Authentification et token JWT
- `GET  /api/v1/tontines` : Liste des tontines de l'utilisateur
- `POST /api/v1/tontines` : Création d'une nouvelle tontine
- `POST /api/v1/tontines/:id/join` : Rejoindre par code d'invitation
- `POST /api/v1/cotisations/payer` : Paiement d'une cotisation (Wave, OM, Portefeuille)
- `GET  /api/v1/cotisations/mes-cotisations` : Historique des cotisations
- `GET  /api/v1/admin/stats` : Statistiques globales de la plateforme (Admin)
- `POST /api/v1/seed/reset` : Réinitialisation des données de démo
