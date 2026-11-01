import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Play,
  Shuffle,
  Award,
  DollarSign,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';
import { ITontine, IMembre, ITour, ICotisation, ILitige } from '../../types.ts';
import { tontineApi, tourApi, cotisationApi, litigeApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF, formatDate, formatDateTime, triggerConfetti } from '../../utils/formatters.ts';
import { PayCotisationModal } from './PayCotisationModal.tsx';
import { WhatsAppReminderModal } from './WhatsAppReminderModal.tsx';

interface TontineDetailProps {
  tontineId: string;
  onBack: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const TontineDetail: React.FC<TontineDetailProps> = ({ tontineId, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    tontine: ITontine & { montantCagnotteTour: number };
    membres: IMembre[];
    tours: ITour[];
    cotisations: ICotisation[];
  } | null>(null);
  const [litiges, setLitiges] = useState<ILitige[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tours' | 'cotisations' | 'membres' | 'litiges'>('tours');
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pay modal state
  const [payingCotisation, setPayingCotisation] = useState<ICotisation | null>(null);

  // WhatsApp reminder modal state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappTargetMembre, setWhatsappTargetMembre] = useState<IMembre | null>(null);
  const [whatsappTargetCotisation, setWhatsappTargetCotisation] = useState<ICotisation | null>(null);

  // Dispute modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeMemberId, setDisputeMemberId] = useState('');

  const fetchTontine = async () => {
    try {
      setLoading(true);
      const [res, litigesRes] = await Promise.all([
        tontineApi.getTontineById(tontineId),
        litigeApi.getByTontine(tontineId),
      ]);

      if (res.success) {
        setData(res);
      }
      if (litigesRes.success) {
        setLitiges(litigesRes.litiges);
      }
    } catch (err: any) {
      console.error('Error fetching detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTontine();
  }, [tontineId]);

  if (loading || !data) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
        Chargement de la tontine...
      </div>
    );
  }

  const { tontine, membres, tours, cotisations } = data;
  const isAdmin = user?.role === 'admin';
  const isPresident = (tontine.president as any)?._id === user?._id || tontine.president === user?._id || isAdmin;
  const myMembre = membres.find((m) => m.user._id === user?._id);

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(tontine.codeInvitation);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // President: Start tontine
  const handleStartTontine = async () => {
    if (!confirm('Êtes-vous sûr de vouloir démarrer la tontine ? Cela génèrera les tours de collecte et lancera le 1er tour.')) return;
    try {
      setActionLoading(true);
      const res = await tontineApi.startTontine(tontine._id);
      if (res.success) {
        triggerConfetti();
        setFeedbackMsg({ type: 'success', text: res.message });
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur au démarrage' });
    } finally {
      setActionLoading(false);
    }
  };

  // President: Randomize draw order
  const handleRandomize = async () => {
    try {
      setActionLoading(true);
      const res = await tontineApi.randomizeOrder(tontine._id);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur tirage' });
    } finally {
      setActionLoading(false);
    }
  };

  // President: Payout tour pot to beneficiary
  const handlePayoutTour = async (tourId: string) => {
    if (!confirm('Confirmez-vous le versement de la cagnotte au bénéficiaire désigné de ce tour ?')) return;
    try {
      setActionLoading(true);
      const res = await tourApi.payoutTour(tourId);
      if (res.success) {
        triggerConfetti();
        setFeedbackMsg({ type: 'success', text: res.message });
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du versement' });
    } finally {
      setActionLoading(false);
    }
  };

  // President: Validate contribution manually
  const handleValidateCotisation = async (cotisationId: string) => {
    try {
      setActionLoading(true);
      const res = await cotisationApi.validateCotisation(cotisationId);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'Cotisation validée avec succès' });
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur de validation' });
    } finally {
      setActionLoading(false);
    }
  };

  // President / Admin: Update member role in tontine
  const handleUpdateMembreRole = async (membreId: string, role: string) => {
    try {
      setActionLoading(true);
      const res = await tontineApi.updateMembreRole(tontine._id, membreId, role);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'attribution du rôle' });
    } finally {
      setActionLoading(false);
    }
  };

  // Create dispute
  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await litigeApi.create({
        tontineId: tontine._id,
        membreConcerneId: disputeMemberId || undefined,
        titre: disputeTitle,
        description: disputeDesc,
      });
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        setIsDisputeModalOpen(false);
        setDisputeTitle('');
        setDisputeDesc('');
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur litige' });
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve dispute
  const handleResolveDispute = async (litigeId: string, statut: string) => {
    const resolution = prompt('Indiquez la décision / note de médiation :') || 'Médiation finalisée.';
    try {
      setActionLoading(true);
      const res = await litigeApi.resolve(litigeId, { statut, resolution });
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        await fetchTontine();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    } finally {
      setActionLoading(false);
    }
  };

  const currentTour = tours.find((t) => t.statut === 'en_cours') || tours[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux tontines
      </button>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  tontine.statut === 'en_cours'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : tontine.statut === 'en_attente'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {tontine.statut === 'en_cours'
                  ? '● Tontine en cours'
                  : tontine.statut === 'en_attente'
                  ? '⏳ En attente de lancement'
                  : 'Terminée'}
              </span>

              {/* Code d'invitation avec bouton copier */}
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-mono font-bold text-slate-800 transition-all"
                title="Cliquer pour copier le code d'invitation"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>Code : {tontine.codeInvitation}</span>
              </button>

              {isPresident && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-full">
                  👑 Vous êtes le Président
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{tontine.nom}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {tontine.description || 'Groupe d\'épargne rotative et solidaire.'}
            </p>
          </div>

          {/* Quick Actions (President, Admin & WhatsApp Reminders) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-wa-reminder-tontine"
              onClick={() => {
                setWhatsappTargetMembre(null);
                setWhatsappTargetCotisation(null);
                setIsWhatsAppModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
              title="Ouvrir les rappels individuels et listes de diffusion WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span>Rappels WhatsApp</span>
            </button>

            {isPresident && tontine.statut === 'en_attente' && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={handleRandomize}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Shuffle className="w-4 h-4 text-slate-600" /> Tirage au sort
                </button>
                <button
                  disabled={actionLoading || membres.length < 2}
                  onClick={handleStartTontine}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-emerald-200" /> Lancer les tours ({membres.length}/{tontine.nombreMembresMax})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cotisation</span>
            <span className="text-base font-black text-slate-900">{formatXOF(tontine.montantCotisation)}</span>
            <span className="text-[10px] text-slate-500 block capitalize">{tontine.frequence}</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Cagnotte du Tour</span>
            <span className="text-base font-black text-emerald-950">
              {formatXOF(tontine.montantCotisation * membres.length)}
            </span>
            <span className="text-[10px] text-emerald-700 block">remise au bénéficiaire</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Membres</span>
            <span className="text-base font-black text-slate-900">
              {membres.length} / {tontine.nombreMembresMax}
            </span>
            <span className="text-[10px] text-slate-500 block">inscrits</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Collecté</span>
            <span className="text-base font-black text-slate-900">{formatXOF(tontine.fondsTotalCollecte)}</span>
            <span className="text-[10px] text-slate-500 block">cumul tous tours</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 text-xs font-bold space-x-4">
        {[
          { id: 'tours', label: `Tours & Bénéficiaires (${tours.length})`, icon: Calendar },
          { id: 'cotisations', label: `Cotisations & Paiements (${cotisations.length})`, icon: CreditCard },
          { id: 'membres', label: `Membres du Cercle (${membres.length})`, icon: Users },
          { id: 'litiges', label: `Litiges & Médiation (${litiges.length})`, icon: MessageSquare },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: TOURS & BENEFICIAIRES */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          {tours.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Aucun tour programmé</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Le président de la tontine doit lancer le cycle lorsque tous les membres ont rejoint.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tours.map((tour) => {
                const beneficiaire = tour.beneficiaire as any;
                const isMe = beneficiaire?._id === user?._id;
                const isCurrent = tour.statut === 'en_cours';
                const isCompleted = tour.statut === 'attribue';

                return (
                  <div
                    key={tour._id}
                    className={`p-6 rounded-3xl border transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-emerald-900 to-teal-900 text-white border-emerald-700 shadow-lg shadow-emerald-950/20'
                        : isCompleted
                        ? 'bg-white border-slate-200/80 shadow-xs'
                        : 'bg-white/80 border-slate-100 shadow-xs opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black ${
                            isCurrent
                              ? 'bg-emerald-400 text-emerald-950'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Tour #{tour.numeroTour}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-200 font-bold animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> En cours de collecte
                          </span>
                        )}
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cagnotte versée
                          </span>
                        )}
                      </div>

                      <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`}>
                        Échéance : {formatDate(tour.datePrevue)}
                      </span>
                    </div>

                    {/* Beneficiary Card */}
                    <div className="flex items-center gap-3.5 mb-4">
                      {beneficiaire?.photoProfil ? (
                        <img
                          src={beneficiaire.photoProfil}
                          alt={beneficiaire.prenom}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                            isCurrent ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {beneficiaire?.prenom?.[0]}
                          {beneficiaire?.nom?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                            {beneficiaire?.prenom} {beneficiaire?.nom}
                          </h4>
                          {isMe && (
                            <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-md">
                              C'est vous !
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isCurrent ? 'text-emerald-200' : 'text-slate-500'}`}>
                          {beneficiaire?.telephone || 'Membre de la tontine'}
                        </p>
                      </div>
                    </div>

                    {/* Pot Amount */}
                    <div
                      className={`p-3.5 rounded-2xl mb-4 flex items-center justify-between ${
                        isCurrent ? 'bg-emerald-800/80' : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`}>
                          Montant de la cagnotte
                        </span>
                        <span className={`text-lg font-black ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                          {formatXOF(tour.montantTotal)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold block ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`}>
                          Cotisations collectées
                        </span>
                        <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {formatXOF(tour.cotisationsRecues)} / {formatXOF(tour.montantTotal)}
                        </span>
                      </div>
                    </div>

                    {/* President Payout Action */}
                    {isCurrent && isPresident && (
                      <button
                        id={`btn-payout-tour-${tour._id}`}
                        disabled={actionLoading}
                        onClick={() => handlePayoutTour(tour._id)}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        Déclencher le versement de la cagnotte ({formatXOF(tour.montantTotal)}) à {beneficiaire?.prenom}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: COTISATIONS */}
      {activeTab === 'cotisations' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Historique des Cotisations du Groupe</h3>
              <p className="text-xs text-slate-500">Suivi des règlements par Wave, Orange Money et Portefeuille</p>
            </div>
          </div>

          {cotisations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucune cotisation enregistrée pour l'instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="pb-3 px-3">Membre</th>
                    <th className="pb-3 px-3">Tour</th>
                    <th className="pb-3 px-3">Montant</th>
                    <th className="pb-3 px-3">Moyen & Réf</th>
                    <th className="pb-3 px-3">Statut</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {cotisations.map((c) => {
                    const membreUser = c.membre as any;
                    const isMyCotisation = membreUser?._id === user?._id;
                    const isUnpaid = c.statut === 'impaye' || c.statut === 'en_retard';

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {membreUser?.prenom?.[0]}
                              {membreUser?.nom?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {membreUser?.prenom} {membreUser?.nom}
                              </p>
                              <p className="text-[10px] text-slate-400">{membreUser?.telephone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                            Tour #{(c.tour as any)?.numeroTour || 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{formatXOF(c.montant)}</td>
                        <td className="py-3 px-3">
                          {c.statut === 'paye' ? (
                            <div>
                              <span className="font-semibold text-slate-800">{c.moyenPaiement || 'Wave'}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {c.referencePaiement || 'TX-OK'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.statut === 'paye'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.statut === 'en_retard'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.statut === 'paye' ? 'Payé' : c.statut === 'en_retard' ? 'En retard' : 'Impayé'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isUnpaid && (
                              <button
                                onClick={() => {
                                  const targetM = membres.find((m) => {
                                    const mUser = (c.membre as any)?.user || (c.membre as any);
                                    return mUser?._id === m.user?._id || (c.membre as any)?._id === m._id;
                                  });
                                  setWhatsappTargetMembre(targetM || null);
                                  setWhatsappTargetCotisation(c);
                                  setIsWhatsAppModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg text-[11px] border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1"
                                title="Envoyer un rappel amical via WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" /> Relance WA
                              </button>
                            )}

                            {isMyCotisation && isUnpaid && (
                              <button
                                onClick={() => setPayingCotisation(c)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[11px] transition-all shadow-xs"
                              >
                                Cotiser (Wave/OM)
                              </button>
                            )}
                            {isPresident && isUnpaid && !isMyCotisation && (
                              <button
                                onClick={() => handleValidateCotisation(c._id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px]"
                              >
                                Marquer payé
                              </button>
                            )}
                            {c.statut === 'paye' && (
                              <span className="text-emerald-600 font-semibold text-[11px] flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reçu émis
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: MEMBRES */}
      {activeTab === 'membres' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Membres du Cercle d'Épargne</h3>
              <p className="text-xs text-slate-500">
                Ordre de tirage, rôles attribués et statistiques individuelles
              </p>
            </div>
            {(isPresident || isAdmin) && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-lg border border-emerald-200">
                👑 En tant que Président(e), vous pouvez attribuer les rôles
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {membres.map((m) => {
              const u = m.user;
              const isPresidentRole = m.role === 'president';

              return (
                <div key={m._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shrink-0">
                        #{m.positionTirage}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-xs">{u.prenom} {u.nom}</h4>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md capitalize ${
                            m.role === 'president' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            m.role === 'secretaire' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                            m.role === 'tresorier' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                            'bg-slate-200/80 text-slate-700'
                          }`}>
                            {m.role === 'president' ? '👑 Président' :
                             m.role === 'secretaire' ? '📝 Secrétaire' :
                             m.role === 'tresorier' ? '💼 Trésorier' : '👤 Membre'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {u.telephone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-[10px] text-slate-400 block font-semibold">Total Cotisé</span>
                        <span className="font-bold text-slate-900">{formatXOF(m.totalCotise)}</span>
                      </div>

                      <button
                        onClick={() => {
                          setWhatsappTargetMembre(m);
                          setWhatsappTargetCotisation(null);
                          setIsWhatsAppModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                        title="Envoyer un rappel ou message WhatsApp à ce membre"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* President / Admin role selector */}
                  {(isPresident || isAdmin) && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">Attribuer un rôle :</span>
                      <select
                        id={`select-role-membre-${m._id}`}
                        value={m.role}
                        onChange={(e) => handleUpdateMembreRole(m._id, e.target.value)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="membre">👤 Membre simple</option>
                        <option value="secretaire">📝 Secrétaire</option>
                        <option value="tresorier">💼 Trésorier(ère)</option>
                        <option value="president">👑 Président(e)</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: LITIGES */}
      {activeTab === 'litiges' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Espace Litiges & Arbitrage</h3>
              <p className="text-xs text-slate-500">Médiation transparente des contestations et retards</p>
            </div>
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all"
            >
              + Déclarer un litige
            </button>
          </div>

          {litiges.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun litige en cours. La tontine fonctionne sans contestation !
            </div>
          ) : (
            <div className="space-y-3">
              {litiges.map((l) => (
                <div key={l._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{l.titre}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        l.statut === 'resolu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.statut}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(l.dateDeclaration)}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{l.description}</p>

                  {l.resolution && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-medium">
                      <strong>Décision arbitrale :</strong> {l.resolution}
                    </div>
                  )}

                  {isPresident && l.statut === 'ouvert' && (
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleResolveDispute(l._id, 'resolu')}
                        className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        Résoudre le litige
                      </button>
                      <button
                        onClick={() => handleResolveDispute(l._id, 'rejete')}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay Modal */}
      <PayCotisationModal
        isOpen={!!payingCotisation}
        cotisation={payingCotisation}
        onClose={() => setPayingCotisation(null)}
        onSuccess={fetchTontine}
      />

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Déclarer un litige</h3>
            <form onSubmit={handleCreateDispute} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre du litige</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Retard de versement ou contestation"
                  value={disputeTitle}
                  onChange={(e) => setDisputeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Explication détaillée</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Expliquez la situation..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Soumettre le litige
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        tontine={tontine}
        membres={membres}
        tours={tours}
        cotisations={cotisations}
        targetMembre={whatsappTargetMembre}
        targetCotisation={whatsappTargetCotisation}
      />
    </div>
  );
};
