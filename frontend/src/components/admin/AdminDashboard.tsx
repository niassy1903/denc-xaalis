import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Coins,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  FileCode,
  Sparkles,
  Database,
  ArrowUpRight,
  UserPlus,
  X,
  KeyRound,
} from 'lucide-react';
import { adminApi, seedApi } from '../../api/api.ts';
import { IUser, ITontine, IAuditLog } from '../../types.ts';
import { formatXOF, formatDateTime } from '../../utils/formatters.ts';

interface AdminDashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [tontines, setTontines] = useState<ITontine[]>([]);
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'kpi' | 'users' | 'tontines' | 'logs'>('kpi');
  const [userSearch, setUserSearch] = useState('');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Admin creation modal state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminPrenom, setAdminPrenom] = useState('');
  const [adminNom, setAdminNom] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('+221 ');
  const [adminPass, setAdminPass] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, tontinesRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getTontines(),
        adminApi.getAuditLogs(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (tontinesRes.success) setTontines(tontinesRes.tontines);
      if (logsRes.success) setLogs(logsRes.logs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingAdmin(true);
      const res = await adminApi.createAdmin({
        prenom: adminPrenom,
        nom: adminNom,
        email: adminEmail,
        telephone: adminPhone,
        motDePasse: adminPass,
      });

      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        setIsAddAdminOpen(false);
        setAdminPrenom('');
        setAdminNom('');
        setAdminEmail('');
        setAdminPhone('+221 ');
        setAdminPass('');
        await fetchAdminData();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la création de l\'administrateur' });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole as any } : u)));
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Erreur rôle' });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatut: string) => {
    const nextStatut = currentStatut === 'actif' ? 'bloque' : 'actif';
    try {
      const res = await adminApi.updateUserStatus(userId, nextStatut);
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, statut: nextStatut as any } : u)));
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Erreur statut' });
    }
  };

  const handleResetSeed = async () => {
    if (!confirm('Attention : cela va réinitialiser la base avec le jeu complet de données de démonstration (utilisateurs, tontines, cotisations, logs). Continuer ?')) return;
    try {
      setLoading(true);
      const res = await seedApi.seedDatabase();
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        await fetchAdminData();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: 'Erreur lors du réensemencement' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.prenom} ${u.nom} ${u.email} ${u.telephone}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
              Super-Admin
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Back Office Denc Xaalis</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision de la plateforme, gestion des utilisateurs, audit de conformité et transactions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddAdminOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" /> + Ajouter un Admin
          </button>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
          <button
            onClick={handleResetSeed}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Database className="w-3.5 h-3.5 text-emerald-200" /> Réensemencer Démo
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-1 text-xs font-bold">
        {[
          { id: 'kpi', label: 'Vue Globale & Métriques', icon: TrendingUp },
          { id: 'users', label: `Utilisateurs (${users.length})`, icon: Users },
          { id: 'tontines', label: `Tontines (${tontines.length})`, icon: Coins },
          { id: 'logs', label: `Logs d'Audit (${logs.length})`, icon: FileCode },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: KPI & STATS */}
      {tab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Utilisateurs Inscrits
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers || 0}</h3>
              <span className="text-[10px] text-emerald-600 font-medium">Membres & Présidents</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Tontines Actives
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.activeTontines || 0}</h3>
              <span className="text-[10px] text-slate-500 font-medium">Sur {stats?.totalTontines || 0} groupes au total</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Volume Transigé
              </span>
              <h3 className="text-2xl font-black text-emerald-900 mt-1">
                {formatXOF(stats?.totalVolumeTransige || 0)}
              </h3>
              <span className="text-[10px] text-teal-600 font-medium">Flux Wave / OM</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Litiges en Cours
              </span>
              <h3 className="text-2xl font-black text-amber-900 mt-1">{stats?.litigesOuverts || 0}</h3>
              <span className="text-[10px] text-amber-600 font-medium">À arbitrer</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick summary box */}
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Répartition des flux monétaires</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-600">Total Cotisations Réglées</span>
                  <span className="font-bold text-slate-900">{stats?.totalCotisationsCount || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-600">Total Portefeuilles Utilisateurs</span>
                  <span className="font-bold text-slate-900">
                    {formatXOF(users.reduce((sum, u) => sum + (u.soldePortefeuille || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-600">Statut Serveur Express / DB</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                    Connecté (MongoDB Réel)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick admin instructions */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl space-y-3">
              <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Sécurité & Conformité
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toutes les opérations d'attribution de cagnotte, changements de rôle et recharges de compte font l'objet d'un log immuable dans la collection d'audit.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setTab('logs')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Consulter les logs d'audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {tab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Gestion des Comptes Utilisateurs</h3>
              <p className="text-xs text-slate-500">Contrôle des rôles et modération des accès</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddAdminOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" /> + Créer Admin
              </button>
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  placeholder="Filtrer par nom, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Utilisateur</th>
                  <th className="pb-3 px-3">Téléphone</th>
                  <th className="pb-3 px-3">Solde</th>
                  <th className="pb-3 px-3">Rôle Actuel</th>
                  <th className="pb-3 px-3">Statut</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-slate-900">
                          {u.prenom} {u.nom}
                        </span>
                        <span className="block text-[10px] text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{u.telephone}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatXOF(u.soldePortefeuille)}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="membre">Membre</option>
                        <option value="president_tontine">Président</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.statut === 'actif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.statut}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.statut)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          u.statut === 'actif'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.statut === 'actif' ? 'Bloquer' : 'Débloquer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TONTINES */}
      {tab === 'tontines' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Supervision de Toutes les Tontines</h3>
              <p className="text-xs text-slate-500">Inspection de l'état d'avancement des cagnottes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Nom & Code</th>
                  <th className="pb-3 px-3">Président</th>
                  <th className="pb-3 px-3">Cotisation</th>
                  <th className="pb-3 px-3">Membres</th>
                  <th className="pb-3 px-3">Total Collecté</th>
                  <th className="pb-3 px-3">Statut</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {tontines.map((t) => {
                  const pres = t.president as any;
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-bold text-slate-900">{t.nom}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{t.codeInvitation}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {pres?.prenom} {pres?.nom}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatXOF(t.montantCotisation)}</td>
                      <td className="py-3 px-3">
                        {t.membresCount || 1}/{t.nombreMembresMax}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-900">{formatXOF(t.fondsTotalCollecte)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.statut === 'en_cours'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.statut === 'en_attente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.statut}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigate('tontine_detail', t._id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px]"
                        >
                          Inspecter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {tab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Registre d'Audit Immuable</h3>
            <p className="text-xs text-slate-500">Traçabilité légale et horodatage de toutes les actions clés</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Date & Heure</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Utilisateur</th>
                  <th className="pb-3 px-3">Adresse IP</th>
                  <th className="pb-3 px-3">Détails JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                {logs.map((log) => {
                  const logUser = log.user as any;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-500">{formatDateTime(log.createdAt)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-800">{log.action}</td>
                      <td className="py-2.5 px-3 font-sans">
                        {logUser ? `${logUser.prenom} ${logUser.nom}` : 'Système'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs font-mono text-[10px]">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Ajouter un Administrateur */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nouvel Administrateur</h3>
                  <p className="text-[11px] text-slate-500">Ajouter un gestionnaire avec accès backoffice</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAdminOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Prénom</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Babacar"
                    value={adminPrenom}
                    onChange={(e) => setAdminPrenom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ndiaye"
                    value={adminNom}
                    onChange={(e) => setAdminNom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Adresse Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin.babacar@dencxaalis.sn"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Téléphone Mobile (Wave / OM)</label>
                <input
                  type="text"
                  required
                  placeholder="+221 77 123 45 67"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mot de Passe Initial</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-900 leading-relaxed">
                Ce compte aura le rôle <strong>Administrateur</strong> avec accès intégral à la supervision, la gestion des utilisateurs, les litiges et l'audit.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50"
                >
                  {creatingAdmin ? 'Création en cours...' : 'Créer l\'administrateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
