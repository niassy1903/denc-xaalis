import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Users,
  User,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Phone,
  AlertTriangle,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { ITontine, IMembre, ICotisation, ITour } from '../../types.ts';
import { formatXOF, formatDate } from '../../utils/formatters.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tontine: ITontine;
  membres: IMembre[];
  tours: ITour[];
  cotisations: ICotisation[];
  targetMembre?: IMembre | null;
  targetCotisation?: ICotisation | null;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  tontine,
  membres,
  tours,
  cotisations,
  targetMembre,
  targetCotisation,
}) => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'individual' | 'broadcast'>(
    targetMembre || targetCotisation ? 'individual' : 'broadcast'
  );
  const [selectedMembreId, setSelectedMembreId] = useState<string>(
    targetMembre?._id || membres[0]?._id || ''
  );
  const [messageLang, setMessageLang] = useState<'fr' | 'wo' | 'en'>('fr');
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [copiedIndividual, setCopiedIndividual] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Active tour
  const currentTour = tours.find((t) => t.statut === 'en_cours') || tours[0];
  const tourNumber = currentTour?.numeroTour || 1;
  const dueDate = currentTour ? formatDate(currentTour.datePrevue) : 'Prochainement';

  // Find unpaid cotisations for the current tour
  const unpaidCotisations = cotisations.filter(
    (c) =>
      c.statut !== 'paye' &&
      ((c.tour as any)?._id === currentTour?._id || (c.tour as any) === currentTour?._id || !currentTour)
  );

  // Map of unpaid members
  const unpaidMembres = membres.filter((m) => {
    return unpaidCotisations.some((c) => {
      const membreUser = (c.membre as any)?.user || (c.membre as any);
      return membreUser?._id === m.user?._id || (c.membre as any)?._id === m._id;
    });
  });

  // Target member data for individual mode
  const currentSelectedMembre = membres.find((m) => m._id === selectedMembreId) || membres[0];
  const selectedUser = currentSelectedMembre?.user;

  // Format clean phone for WhatsApp (Senegal 221 prefix)
  const sanitizePhone = (phoneStr?: string) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.length === 9 && (cleaned.startsWith('77') || cleaned.startsWith('78') || cleaned.startsWith('76') || cleaned.startsWith('70') || cleaned.startsWith('75'))) {
      cleaned = '221' + cleaned;
    }
    return cleaned;
  };

  // Generate Individual Message
  const generateIndividualMessage = () => {
    const name = selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : 'Cher membre';
    const amount = formatXOF(tontine.montantCotisation);

    if (messageLang === 'wo') {
      return `Salam ${name} 👋,\n\nFàttali bu baax ci sa càcc ci natt bi *${tontine.nom}* (Tour #${tourNumber}).\n💰 Montant : *${amount}*\n📅 Bisu jot bi : *${dueDate}*\n\nMën nga fey ci benn klig ci Wave mbaa Orange Money ci Denc Xaalis.\nJërëjëf ci kóllëre gi ! ✨`;
    }

    if (messageLang === 'en') {
      return `Hello ${name} 👋,\n\nFriendly reminder for your rotating savings contribution in *${tontine.nom}* (Round #${tourNumber}).\n💰 Amount: *${amount}*\n📅 Due date: *${dueDate}*\n\nPlease make your payment via Wave, Orange Money, or your Denc Xaalis digital wallet.\nThank you! 🚀`;
    }

    return `Salam ${name} 👋,\n\nPetit rappel amical pour le règlement de ta cotisation dans la tontine *${tontine.nom}* (Tour #${tourNumber}).\n💰 Montant : *${amount}*\n📅 Date limite : *${dueDate}*\n\nTu peux régler en un clic via Wave, Orange Money ou ton portefeuille Denc Xaalis.\nMerci pour ta ponctualité et ton engagement ! 🤝✨`;
  };

  // Generate Broadcast Message
  const generateBroadcastMessage = () => {
    const amount = formatXOF(tontine.montantCotisation);
    const totalMissing = unpaidMembres.length * tontine.montantCotisation;

    const listNames = unpaidMembres.length > 0
      ? unpaidMembres.map((m) => `▫️ *${m.user.prenom} ${m.user.nom}* (${m.user.telephone})`).join('\n')
      : '▫️ _Tous les membres ont cotisé !_';

    if (messageLang === 'wo') {
      return `📢 *RAPPEL GLOBAL NATT DENC XAALIS* 📢\n\nNatt : *${tontine.nom}*\nTour : *#${tourNumber}*\n📅 Bisu ramasaas bi : *${dueDate}*\n💰 Càcc gu nekk : *${amount}*\n\n👥 *Ñi wara fey :*\n${listNames}\n\n👉 Feyeel ci Wave mbaa Orange Money ci Denc Xaalis ngir ñu mën a ramasaas cagnotte bi ci jam !\n\nJërëjëf ñépp ! 🇸🇳`;
    }

    return `📢 *RAPPEL DE COTISATION GROUPE - DENC XAALIS* 📢\n\nTontine : *${tontine.nom}*\nCycle en cours : *Tour #${tourNumber}*\n📅 Échéance : *${dueDate}*\n💰 Montant individuel : *${amount}*\n\n👥 *Membres en attente de cotisation (${unpaidMembres.length}) :*\n${listNames}\n\n⚠️ *Montant total restant à collecter :* ${formatXOF(totalMissing)}\n\n💡 Merci de valider votre cotisation dès aujourd'hui via *Wave*, *Orange Money* ou solde *Denc Xaalis* pour permettre le versement ponctuel de la cagnotte au bénéficiaire désigné !\n\n_Denc Xaalis Fintech Sénégal_`;
  };

  // Send Individual WhatsApp
  const handleSendIndividualWhatsApp = (phone?: string, text?: string) => {
    const rawPhone = phone || selectedUser?.telephone;
    const cleanPhone = sanitizePhone(rawPhone);
    const msg = text || generateIndividualMessage();
    const encoded = encodeURIComponent(msg);

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    if (currentSelectedMembre?._id) {
      setSentMap((prev) => ({ ...prev, [currentSelectedMembre._id]: true }));
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copy Individual
  const handleCopyIndividual = () => {
    navigator.clipboard.writeText(generateIndividualMessage());
    setCopiedIndividual(true);
    setTimeout(() => setCopiedIndividual(false), 2000);
  };

  // Copy Broadcast
  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(generateBroadcastMessage());
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Rappels WhatsApp Automatisés</h3>
                <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-md uppercase">
                  Denc Xaalis
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {tontine.nom} • Tour #{tourNumber} ({formatXOF(tontine.montantCotisation)}/membre)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 gap-2 shrink-0">
          <button
            id="tab-reminder-broadcast"
            onClick={() => setMode('broadcast')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              mode === 'broadcast'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Rappel Global & Diffusion ({unpaidMembres.length} impayés)
          </button>

          <button
            id="tab-reminder-individual"
            onClick={() => setMode('individual')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              mode === 'individual'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Rappel Individuel (Sélection membre)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Language choice for message template */}
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Langue du message WhatsApp :
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { code: 'fr', label: '🇫🇷 Français' },
                { code: 'wo', label: '🇸🇳 Wolof' },
                { code: 'en', label: '🇬🇧 English' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setMessageLang(l.code as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    messageLang === l.code
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* ================= MODE BROADCAST / GLOBAL ================= */}
          {mode === 'broadcast' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Stat Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block uppercase">
                    Membres à relancer
                  </span>
                  <span className="text-xl font-black text-emerald-950 dark:text-emerald-100">
                    {unpaidMembres.length} / {membres.length}
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-800">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block uppercase">
                    Cagnotte restante
                  </span>
                  <span className="text-xl font-black text-amber-950 dark:text-amber-100">
                    {formatXOF(unpaidMembres.length * tontine.montantCotisation)}
                  </span>
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-800">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 block uppercase">
                    Échéance du Tour
                  </span>
                  <span className="text-sm font-black text-blue-950 dark:text-blue-100 mt-1 block">
                    {dueDate}
                  </span>
                </div>
              </div>

              {/* Broadcast Text Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Texte formaté pour liste de diffusion / Groupe WhatsApp :
                  </label>
                  <button
                    onClick={handleCopyBroadcast}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    {copiedBroadcast ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copier le texte
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
                  {generateBroadcastMessage()}
                </div>
              </div>

              {/* Quick Ping List (Un-par-un) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Envoi rapide par membre (WhatsApp Me direct)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Cliquez sur "Envoyer" pour ouvrir la discussion directe
                  </span>
                </div>

                {unpaidMembres.length === 0 ? (
                  <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Tous les membres sont à jour pour ce tour ! Aucune relance nécessaire.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {unpaidMembres.map((m) => {
                      const isSent = sentMap[m._id];
                      return (
                        <div
                          key={m._id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              #{m.positionTirage}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-900 dark:text-white">
                                {m.user.prenom} {m.user.nom}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {m.user.telephone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSent && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Envoyé
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedMembreId(m._id);
                                const singleText = generateIndividualMessage();
                                handleSendIndividualWhatsApp(m.user.telephone, singleText);
                                setSentMap((prev) => ({ ...prev, [m._id]: true }));
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" /> Relancer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Primary Action Button */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(generateBroadcastMessage());
                    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Diffuser le message sur WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE INDIVIDUEL ================= */}
          {mode === 'individual' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Member Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sélectionner le membre à relancer :
                </label>
                <select
                  value={selectedMembreId}
                  onChange={(e) => setSelectedMembreId(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {membres.map((m) => (
                    <option key={m._id} value={m._id}>
                      #{m.positionTirage} - {m.user.prenom} {m.user.nom} ({m.user.telephone}) — {m.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Member Summary Card */}
              {selectedUser && (
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center">
                      #{currentSelectedMembre?.positionTirage}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedUser.prenom} {selectedUser.nom}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {selectedUser.telephone} • {selectedUser.email || 'Membre vérifié'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold block">Montant à régler</span>
                    <span className="font-black text-emerald-800 dark:text-emerald-300 text-base">
                      {formatXOF(tontine.montantCotisation)}
                    </span>
                  </div>
                </div>
              )}

              {/* Individual Message Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Aperçu du message WhatsApp individuel :
                  </label>
                  <button
                    onClick={handleCopyIndividual}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    {copiedIndividual ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copier
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                  {generateIndividualMessage()}
                </div>
              </div>

              {/* Direct Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSendIndividualWhatsApp()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Envoyer via WhatsApp à {selectedUser?.prenom}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
