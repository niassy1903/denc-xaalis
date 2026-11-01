import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  QrCode,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ITontine } from '../../types.ts';
import { tontineApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF, formatDate } from '../../utils/formatters.ts';

interface TontinesListProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
}

export const TontinesList: React.FC<TontinesListProps> = ({ onNavigate, onOpenCreate, onOpenJoin }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [tontines, setTontines] = useState<ITontine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTontines = async () => {
    try {
      setLoading(true);
      if (tab === 'my') {
        const res = await tontineApi.getMyTontines();
        if (res.success) setTontines(res.tontines);
      } else {
        const res = await tontineApi.getPublicTontines();
        if (res.success) setTontines(res.tontines);
      }
    } catch (err) {
      console.error('Error fetching tontines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTontines();
  }, [tab]);

  const filtered = tontines.filter((t) => {
    const matchesSearch =
      t.nom.toLowerCase().includes(search.toLowerCase()) ||
      t.codeInvitation?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Groupes de Tontine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos cercles d'épargne rotative ou découvrez de nouvelles tontines disponibles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-list-join"
            onClick={onOpenJoin}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-xs"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            Rejoindre avec un code
          </button>
          <button
            id="btn-list-create"
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            Créer une Tontine
          </button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Main Tab */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            id="tab-my-tontines"
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'my'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mes Tontines ({tab === 'my' ? tontines.length : '...'})
          </button>
          <button
            id="tab-public-tontines"
            onClick={() => setTab('public')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'public'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catalogue Public
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="en_attente">En attente</option>
            <option value="terminee">Terminée</option>
          </select>
        </div>
      </div>

      {/* Tontine Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
          Chargement des tontines...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Aucune tontine trouvée</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {tab === 'my'
              ? 'Vous n\'avez pas encore rejoint de tontine. Rejoignez un groupe avec un code ou créez le vôtre.'
              : 'Aucune tontine ne correspond à vos filtres.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tontine) => {
            const isPresident = (tontine.president as any)?._id === user?._id || tontine.president === user?._id;
            const presidentName =
              typeof tontine.president === 'object' && tontine.president
                ? `${(tontine.president as any).prenom} ${(tontine.president as any).nom}`
                : 'Président';

            const statusBadge =
              tontine.statut === 'en_cours'
                ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: '● En cours' }
                : tontine.statut === 'en_attente'
                ? { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: '⏳ En attente de membres' }
                : { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'Terminée' };

            const cagnotteTour = tontine.montantCotisation * (tontine.membresCount || tontine.nombreMembresMax);

            return (
              <div
                key={tontine._id}
                onClick={() => onNavigate('tontine_detail', tontine._id)}
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                      {statusBadge.text}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-md">
                      {tontine.codeInvitation}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {tontine.nom}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tontine.description || 'Épargne rotative solidaire.'}
                  </p>

                  {/* Highlights Grid */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-2xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cotisation</span>
                      <span className="font-bold text-slate-900">{formatXOF(tontine.montantCotisation)}</span>
                      <span className="text-[10px] text-slate-500 block capitalize">{tontine.frequence}</span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-2xl">
                      <span className="text-[10px] text-emerald-800 block font-semibold uppercase">Cagnotte par tour</span>
                      <span className="font-bold text-emerald-950">{formatXOF(cagnotteTour)}</span>
                      <span className="text-[10px] text-emerald-700 block">à chaque tirage</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      <strong>{tontine.membresCount || 1}</strong>/{tontine.nombreMembresMax} membres
                    </span>
                  </div>

                  <span className="text-emerald-800 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isPresident ? 'Administrer' : 'Consulter'} <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
