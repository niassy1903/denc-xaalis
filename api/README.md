# 🌐 Denc Xaalis - Module API Client & SDK TypeScript

Ce dossier contient le client HTTP Axios typé, les interfaces de données et l'ensemble des services pour consommer l'API REST Denc Xaalis depuis le frontend ou toute autre application.

## 📦 Contenu

- `api.ts` : Services clients (`authApi`, `tontinesApi`, `cotisationsApi`, `walletApi`, `adminApi`, `litigesApi`, `notificationsApi`, `seedApi`)
- `types.ts` : Interfaces TypeScript pour tous les modèles (Utilisateur, Tontine, Cotisation, Tour, Litige, Log, AdminStats)
- `index.ts` : Export centralisé

## 🔧 Utilisation

```typescript
import { authApi, tontinesApi, cotisationsApi } from '../api/index.ts';

// Exemple : Récupérer mes tontines
const response = await tontinesApi.getMyTontines();
console.log(response.tontines);
```
