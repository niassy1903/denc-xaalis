import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  IUser,
  ITontine,
  IMembre,
  ITour,
  ICotisation,
  ITransaction,
  ILitige,
  INotification,
  IAuditLog,
  IAdminStats,
} from './types.ts';

const API_ENV = (import.meta as any).env;
const API_BASE_URL =
  API_ENV?.VITE_API_URL ||
  (API_ENV?.PROD ? 'https://denc-xaalis.onrender.com/api/v1' : '/api/v1');

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour injecter automatiquement le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('denc_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et déconnexions 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Éviter de déconnecter si on est sur la page de login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Optionnel: notifier
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. MODULE AUTHENTIFICATION
// ==========================================
export const authApi = {
  login: async (credentials: { email: string; motDePasse: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string; token: string; user: IUser }>(
      '/auth/login',
      credentials
    );
    if (res.data.token) {
      localStorage.setItem('denc_token', res.data.token);
      localStorage.setItem('denc_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    motDePasse: string;
    role?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; message: string; token: string; user: IUser }>(
      '/auth/register',
      data
    );
    if (res.data.token) {
      localStorage.setItem('denc_token', res.data.token);
      localStorage.setItem('denc_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; user: IUser }>('/auth/me');
    if (res.data.user) {
      localStorage.setItem('denc_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  updateProfile: async (data: Partial<IUser>) => {
    const res = await apiClient.put<{ success: boolean; message: string; user: IUser }>('/auth/profile', data);
    if (res.data.user) {
      localStorage.setItem('denc_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getCaptcha: async () => {
    const res = await apiClient.get<{ success: boolean; question: string; token: string }>('/auth/captcha');
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('denc_token');
      localStorage.removeItem('denc_user');
    }
  },
};

export default apiClient;

// ==========================================
// 2. MODULE TONTINES
// ==========================================
export const tontineApi = {
  getMyTontines: async () => {
    const res = await apiClient.get<{ success: boolean; tontines: ITontine[] }>('/tontines/my');
    return res.data;
  },

  getPublicTontines: async () => {
    const res = await apiClient.get<{ success: boolean; tontines: ITontine[] }>('/tontines/public');
    return res.data;
  },

  getTontineById: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      tontine: ITontine & { montantCagnotteTour: number };
      membres: IMembre[];
      tours: ITour[];
      cotisations: ICotisation[];
    }>(`/tontines/${id}`);
    return res.data;
  },

  createTontine: async (data: {
    nom: string;
    description?: string;
    montantCotisation: number;
    frequence: string;
    nombreMembresMax: number;
    regles?: string;
    dateDebut?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; message: string; tontine: ITontine }>('/tontines', data);
    return res.data;
  },

  joinTontineByCode: async (codeInvitation: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; tontineId: string; membre: IMembre }>(
      '/tontines/join',
      { codeInvitation }
    );
    return res.data;
  },

  startTontine: async (tontineId: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; tontine: ITontine; tours: ITour[] }>(
      `/tontines/${tontineId}/start`
    );
    return res.data;
  },

  randomizeOrder: async (tontineId: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/tontines/${tontineId}/randomize`);
    return res.data;
  },

  updateMembreRole: async (tontineId: string, membreId: string, role: string) => {
    const res = await apiClient.put<{ success: boolean; message: string; membre: IMembre }>(
      `/tontines/${tontineId}/membres/${membreId}/role`,
      { role }
    );
    return res.data;
  },
};

// ==========================================
// 3. MODULE COTISATIONS
// ==========================================
export const cotisationApi = {
  getMyCotisations: async () => {
    const res = await apiClient.get<{ success: boolean; cotisations: ICotisation[] }>('/cotisations/my');
    return res.data;
  },

  getByTontine: async (tontineId: string) => {
    const res = await apiClient.get<{ success: boolean; cotisations: ICotisation[] }>(
      `/cotisations/tontine/${tontineId}`
    );
    return res.data;
  },

  payCotisation: async (
    cotisationId: string,
    data: { moyenPaiement: string; referencePaiement?: string; justificatif?: string }
  ) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      cotisation: ICotisation;
      transaction: ITransaction;
      soldePortefeuille?: number;
    }>(`/cotisations/${cotisationId}/pay`, data);
    return res.data;
  },

  validateCotisation: async (cotisationId: string) => {
    const res = await apiClient.put<{ success: boolean; message: string; cotisation: ICotisation }>(
      `/cotisations/${cotisationId}/validate`
    );
    return res.data;
  },
};

// ==========================================
// 4. MODULE TOURS & CAGNOTTE
// ==========================================
export const tourApi = {
  getByTontine: async (tontineId: string) => {
    const res = await apiClient.get<{ success: boolean; tours: ITour[] }>(`/tours/tontine/${tontineId}`);
    return res.data;
  },

  payoutTour: async (tourId: string) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      tour: ITour;
      transaction: ITransaction;
      tontineStatut: string;
      prochainTourNumero: number | null;
    }>(`/tours/${tourId}/payout`);
    return res.data;
  },
};

// ==========================================
// 5. MODULE TRANSACTIONS & PORTEFEUILLE
// ==========================================
export const transactionApi = {
  getMyTransactions: async () => {
    const res = await apiClient.get<{ success: boolean; transactions: ITransaction[] }>('/transactions/my');
    return res.data;
  },

  deposit: async (data: { montant: number; moyenPaiement: string }) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      soldePortefeuille: number;
      transaction: ITransaction;
    }>('/transactions/deposit', data);
    return res.data;
  },
};

// ==========================================
// 6. MODULE LITIGES
// ==========================================
export const litigeApi = {
  getByTontine: async (tontineId: string) => {
    const res = await apiClient.get<{ success: boolean; litiges: ILitige[] }>(`/litiges/tontine/${tontineId}`);
    return res.data;
  },

  create: async (data: { tontineId: string; membreConcerneId?: string; titre: string; description: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string; litige: ILitige }>('/litiges', data);
    return res.data;
  },

  resolve: async (litigeId: string, data: { statut: string; resolution: string }) => {
    const res = await apiClient.put<{ success: boolean; message: string; litige: ILitige }>(
      `/litiges/${litigeId}/resolve`,
      data
    );
    return res.data;
  },
};

// ==========================================
// 7. MODULE NOTIFICATIONS
// ==========================================
export const notificationApi = {
  getMyNotifications: async () => {
    const res = await apiClient.get<{ success: boolean; notifications: INotification[]; nonLuesCount: number }>(
      '/notifications/my'
    );
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.put<{ success: boolean; message: string }>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.put<{ success: boolean; message: string }>('/notifications/read-all');
    return res.data;
  },
};

// ==========================================
// 8. MODULE ADMIN (BACK OFFICE)
// ==========================================
export const adminApi = {
  getStats: async () => {
    const res = await apiClient.get<{ success: boolean; stats: IAdminStats }>('/admin/stats');
    return res.data;
  },

  getUsers: async (params?: { search?: string; role?: string; statut?: string }) => {
    const res = await apiClient.get<{ success: boolean; users: IUser[] }>('/admin/users', { params });
    return res.data;
  },

  createAdmin: async (data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    motDePasse: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; message: string; user: IUser }>('/admin/create-admin', data);
    return res.data;
  },

  updateUserStatus: async (userId: string, statut: string) => {
    const res = await apiClient.put<{ success: boolean; message: string; user: IUser }>(
      `/admin/users/${userId}/status`,
      { statut }
    );
    return res.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const res = await apiClient.put<{ success: boolean; message: string; user: IUser }>(
      `/admin/users/${userId}/role`,
      { role }
    );
    return res.data;
  },

  getTontines: async () => {
    const res = await apiClient.get<{ success: boolean; tontines: ITontine[] }>('/admin/tontines');
    return res.data;
  },

  getTransactions: async () => {
    const res = await apiClient.get<{ success: boolean; transactions: ITransaction[] }>('/admin/transactions');
    return res.data;
  },

  getLitiges: async () => {
    const res = await apiClient.get<{ success: boolean; litiges: ILitige[] }>('/admin/litiges');
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await apiClient.get<{ success: boolean; logs: IAuditLog[] }>('/admin/audit-logs');
    return res.data;
  },
};

// ==========================================
// 9. SEED / DEMO DATA INITIALIZER
// ==========================================
export const seedApi = {
  seedDatabase: async () => {
    const res = await apiClient.post<{ success: boolean; message: string; comptesDisponibles: any[] }>('/seed');
    return res.data;
  },
};
