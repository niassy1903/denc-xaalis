import React, { useState, useEffect } from 'react';
import {
  Users,
  Coins,
  TrendingUp,
  CreditCard,
  PlusCircle,
  QrCode,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { ITontine, ICotisation, ITransaction } from '../../types.ts';
import { tontineApi, cotisationApi, transactionApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF, formatDate } from '../../utils/formatters.ts';

interface MemberDashboardProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenCreateTontine: () => void;
  onOpenJoinTontine: () => void;
  onPayCotisation: (cotisation: ICotisation) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onNavigate,
  onOpenCreateTontine,
  onOpenJoinTontine,
  onPayCotisation,
}) => {
  const { user } = useAuth();
  const [myTontines, setMyTontines] = useState<ITontine[]>([]);
  const [myCotisations, setMyCotisations] = useState<ICotisation[]>([]);
  const [myTransactions, setMyTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tontinesRes, cotisationsRes, txRes] = await Promise.all([
        tontineApi.getMyTontines(),
        cotisationApi.getMyCotisations(),
        transactionApi.getMyTransactions(),
      ]);

      if (tontinesRes.success) setMyTontines(tontinesRes.tontines);
      if (cotisationsRes.success) setMyCotisations(cotisationsRes.cotisations);
      if (txRes.success) setMyTransactions(txRes.transactions);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculs statistiques
  const cotisationsEnAttente = myCotisations.filter((c) => c.statut === 'impaye' || c.statut === 'en_retard');
  const cotisationsPayees = myCotisations.filter((c) => c.statut === 'paye');
  const totalCotise = cotisationsPayees.reduce((acc, c) => acc + (c.montant || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-full mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Plateforme Denc Xaalis • Session Sécurisée
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bonjour, {user?.prenom} {user?.nom} 👋🏾
            </h1>
            <p className="text-sm text-emerald-200/90 mt-1 leading-relaxed">
              Bienvenue sur votre espace d'épargne rotative. Suivez l'avancement de vos cagnottes et réglez vos cotisations en toute simplicité.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-btn-join"
              onClick={onOpenJoinTontine}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-700/80 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-300" />
              Rejoindre une tontine
            </button>
            <button
              id="dash-btn-create"
              onClick={onOpenCreateTontine}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-2xl text-xs font-black transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Créer une tontine
            </button>
          </div>
        </div>

        {/* Ambient subtle background decorative circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portefeuille</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{formatXOF(user?.soldePortefeuille)}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Disponible pour cotiser</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mes Tontines</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{myTontines.length} groupe{myTontines.length > 1 ? 's' : ''}</h3>
            <span className="text-[10px] text-indigo-600 font-medium">
              {myTontines.filter((t) => t.statut === 'en_cours').length} active{myTontines.filter((t) => t.statut === 'en_cours').length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cotisé</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{formatXOF(totalCotise)}</h3>
            <span className="text-[10px] text-teal-600 font-medium">{cotisationsPayees.length} tours validés</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">À régler</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{cotisationsEnAttente.length} cotisation{cotisationsEnAttente.length > 1 ? 's' : ''}</h3>
            <span className="text-[10px] text-amber-700 font-medium">
              {cotisationsEnAttente.length > 0 ? 'Action requise' : 'À jour !'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Tontines en cours & Cotisations en attente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Mes Tontines Actives */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Mes Groupes de Tontine</h2>
              <p className="text-xs text-slate-500">Vue d'ensemble de vos cercles d'épargne</p>
            </div>
            <button
              onClick={() => onNavigate('tontines')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline"
            >
              Voir tout ({myTontines.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
              Chargement des tontines...
            </div>
          ) : myTontines.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Vous n'avez rejoint aucune tontine</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Créez votre propre groupe ou rejoignez un groupe existant avec un code d'invitation.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={onOpenJoinTontine}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Entrer un code
                </button>
                <button
                  onClick={onOpenCreateTontine}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl"
                >
                  Créer un groupe
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTontines.map((tontine) => {
                const isPresident = (tontine.president as any)?._id === user?._id || tontine.president === user?._id;
                const statusColor =
                  tontine.statut === 'en_cours'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : tontine.statut === 'en_attente'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div
                    key={tontine._id}
                    onClick={() => onNavigate('tontine_detail', tontine._id)}
                    className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                          {tontine.statut === 'en_cours' ? '● En cours' : tontine.statut === 'en_attente' ? '⏳ En attente de membres' : 'Terminée'}
                        </span>
                        {isPresident && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">
                            Président(e)
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors text-sm line-clamp-1">
                        {tontine.nom}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tontine.description || 'Aucune description'}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cotisation</span>
                          <span className="font-bold text-slate-800">{formatXOF(tontine.montantCotisation)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fréquence</span>
                          <span className="font-medium text-slate-700 capitalize">{tontine.frequence}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        👥 {tontine.membresCount || 1}/{tontine.nombreMembresMax} membres
                      </span>
                      <span className="text-emerald-800 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Accéder <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Échéances / Cotisations urgentes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Cotisations à Régler</h2>
              <p className="text-xs text-slate-500">Paiements attendus pour vos tours</p>
            </div>
          </div>

          {cotisationsEnAttente.length === 0 ? (
            <div className="p-6 bg-white rounded-3xl border border-slate-100 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Toutes vos cotisations sont à jour</h4>
              <p className="text-[11px] text-slate-500">
                Vous n'avez aucun paiement en retard ou en attente pour l'instant.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cotisationsEnAttente.map((c) => (
                <div
                  key={c._id}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        Tour #{(c.tour as any)?.numeroTour || 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {(c.tontine as any)?.nom || 'Tontine'}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" /> Échéance : {formatDate(c.dateEcheance)}
                      </p>
                    </div>
                    <span className="text-sm font-black text-slate-900">{formatXOF(c.montant)}</span>
                  </div>

                  <button
                    id={`btn-pay-cotisation-${c._id}`}
                    onClick={() => onPayCotisation(c)}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Cotiser maintenant (Wave / OM)
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick info box on Tontines */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4" /> Le saviez-vous ?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dans le système rotatif Denc Xaalis, 100% des cotisations du tour sont reversées au bénéficiaire désigné dès que l'ensemble des membres a cotisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
