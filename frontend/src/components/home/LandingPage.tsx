import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Users,
  Calendar,
  CheckCircle2,
  Phone,
  MessageCircle,
  Zap,
  TrendingUp,
  Award,
  Lock,
  RefreshCw,
  Clock,
  HelpCircle,
  FileCheck,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { formatXOF } from '../../utils/formatters.ts';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenCreateTontine: () => void;
  onOpenJoinTontine: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenCreateTontine,
  onOpenJoinTontine,
}) => {
  const { t, language } = useLanguage();

  // Interactive Simulator State
  const [simMembers, setSimMembers] = useState<number>(10);
  const [simAmount, setSimAmount] = useState<number>(50000);
  const [simFreq, setSimFreq] = useState<'hebdomadaire' | 'mensuel'>('mensuel');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'payments' | 'security' | 'whatsapp' | 'comparison'>('payments');

  // Calculated simulator values
  const totalPotPerRound = simMembers * simAmount;
  const totalCirculatingVolume = simMembers * totalPotPerRound;
  const cycleMonths = simFreq === 'mensuel' ? simMembers : Math.ceil(simMembers / 4);

  return (
    <div className="space-y-20 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-400/15 to-teal-500/15 dark:from-emerald-600/20 dark:to-teal-600/15 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 rounded-full text-xs font-black tracking-wide shadow-xs animate-in fade-in">
            {t('heroBadge', 'Plateforme Officielle Denc Xaalis SN')}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-950 dark:text-white">
            {t('heroTitle1', "L'Épargne Rotative Moderne,")}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300">
              {t('heroTitleHighlight', 'Transparente & Sécurisée')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            {t(
              'heroDesc',
              "Gérez vos tontines (Natt) en toute confiance. Automatisez les cotisations via Wave et Orange Money, suivez l'ordre des bénéficiaires et sécurisez chaque tour de collecte au Sénégal."
            )}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <button
              id="hero-btn-join"
              onClick={onOpenRegister}
              className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-700/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              {t('registerCta', 'Créer un compte gratuit')} <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-btn-login"
              onClick={onOpenLogin}
              className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700 font-bold text-sm rounded-2xl shadow-xs transition-all"
            >
              {t('loginCta', 'Connexion à mon compte')}
            </button>

            <button
              id="hero-btn-join-code"
              onClick={onOpenJoinTontine}
              className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-bold text-sm rounded-2xl transition-all"
            >
               {t('joinWithCode', 'Rejoindre avec un code')}
            </button>
          </div>

          {/* Interactive Live Hero Visual Banner */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 bg-white/80 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Cagnottes Versées
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                    480M+ FCFA
                  </span>
                  <span className="text-[10px] text-slate-500">100% sécurisé</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Membres Actifs
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    15 400+
                  </span>
                  <span className="text-[10px] text-slate-500">Dakar & Régions</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Taux de Ponctualité
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 mt-1 block">
                    99.4%
                  </span>
                  <span className="text-[10px] text-slate-500">Rappels WhatsApp</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Opérateurs
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                    Wave & OM
                  </span>
                  <span className="text-[10px] text-slate-500">Zéro commission cachée</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. INTERACTIVE SIMULATOR ================= */}
      <section className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('simTitle', 'Simulateur de Cagnotte Natt')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Calculez la puissance financière de votre cercle
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Ajustez le nombre de participants et la cotisation pour voir instantanément les montants collectés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
            {/* Sliders Controls */}
            <div className="space-y-6 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
              {/* Members Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">{t('membersCount', 'Nombre de membres')} :</span>
                  <span className="px-2.5 py-1 bg-emerald-900/80 text-emerald-300 rounded-lg font-mono text-sm">
                    {simMembers} membres
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={30}
                  step={1}
                  value={simMembers}
                  onChange={(e) => setSimMembers(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>3 membres</span>
                  <span>15</span>
                  <span>30 membres</span>
                </div>
              </div>

              {/* Amount Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">{t('contributionAmount', 'Cotisation par membre')} :</span>
                  <span className="px-2.5 py-1 bg-emerald-900/80 text-emerald-300 rounded-lg font-mono text-sm">
                    {formatXOF(simAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={250000}
                  step={5000}
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5 000 FCFA</span>
                  <span>100 000 FCFA</span>
                  <span>250 000 FCFA</span>
                </div>
              </div>

              {/* Frequency Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Fréquence des tours :</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSimFreq('mensuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      simFreq === 'mensuel'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    📅 Mensuelle
                  </button>
                  <button
                    onClick={() => setSimFreq('hebdomadaire')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      simFreq === 'hebdomadaire'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    ⚡ Hebdomadaire
                  </button>
                </div>
              </div>
            </div>

            {/* Live Result Display */}
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-emerald-900/90 to-teal-950 rounded-2xl border border-emerald-700/60 shadow-lg space-y-4">
                <div>
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                    {t('totalPotPerRound', 'Cagnotte par tour de ramassage')}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                    {formatXOF(totalPotPerRound)}
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Versée automatiquement au bénéficiaire désigné à chaque cycle.
                  </p>
                </div>

                <div className="pt-4 border-t border-emerald-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Durée du cycle :</span>
                    <span className="font-bold text-white text-sm">
                      {cycleMonths} {simFreq === 'mensuel' ? 'Mois' : 'Semaines'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Volume total :</span>
                    <span className="font-bold text-emerald-300 text-sm">
                      {formatXOF(totalCirculatingVolume)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onOpenRegister}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Lancer cette tontine maintenant <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. STEP BY STEP PROCESS ================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">
            Comment fonctionne Denc Xaalis ?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Une expérience 100% fluide, transparente et fidèle aux traditions sénégalaises
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 relative group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-base">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step1Title', '1. Création de Tontine')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'step1Desc',
                'Définissez le montant, la fréquence et invitez vos proches avec un code secret unique.'
              )}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 relative group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-base">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step2Title', '2. Cotisations Sécurisées')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'step2Desc',
                'Chaque membre cotise par Wave, Orange Money ou son solde avec génération de reçu certifié.'
              )}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 relative group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-black text-base">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step3Title', '3. Attribution Impartiale')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'step3Desc',
                'Tirage au sort transparent ou ordre fixé d’avance selon les accords du cercle.'
              )}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 relative group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-base">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step4Title', '4. Versement Instantané')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'step4Desc',
                'Le bénéficiaire du tour reçoit l’intégralité de la cagnotte directement sur son portefeuille.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ================= 4. INTERACTIVE FEATURE EXPLORER ================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">
            Pourquoi choisir Denc Xaalis ?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Découvrez tous les avantages de la digitalisation de vos cercles d'épargne
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2 overflow-x-auto pb-1">
          {[
            { id: 'payments', label: '💳 Mobile Money Wave & OM', icon: Wallet },
            { id: 'whatsapp', label: '💬 Relances WhatsApp & Diffusion', icon: MessageCircle },
            { id: 'security', label: '🛡️ Sécurité & Certification', icon: ShieldCheck },
            { id: 'comparison', label: '⚖️ Digital vs Tontine Papier', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {activeFeatureTab === 'payments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                  🌊 Wave SN & 🍊 Orange Money
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Cotisations instantanées sans déplacement
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Finies les collectes manuelles et le risque de manipuler du liquide. Les membres effectuent leurs versements en un clic depuis leur téléphone avec un reçu électronique infalsifiable.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Validation automatique et mise à jour immédiate du statut
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Zéro frais cachés pour la tontine
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Portefeuille digital intégré pour stocker ou retirer ses gains
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Aperçu transactionnel</span>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                      Wave
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Cotisation Tour #3</p>
                      <p className="text-[10px] text-slate-400">Ref: WV-789218 • Validé</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">+50 000 FCFA</span>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'whatsapp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
                  💬 Automatisation WhatsApp
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Rappels intelligents & Listes de diffusion
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ne perdez plus de temps à poursuivre les retardataires. Générez des relances amicales personnalisées (en Wolof ou Français) d’un simple clic sur WhatsApp ou diffusez le récapitulatif dans votre groupe.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Relance 1-par-1 directe avec message pré-rempli
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Liste de diffusion automatique avec la liste exacte des impayés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Support officiel dédié joignable au +221 70 461 18 94
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 shadow-inner whitespace-pre-wrap leading-relaxed">
                {`📢 *RAPPEL DE COTISATION DENC XAALIS*
Tontine : *Képar Gui Dakar* (Tour #2)
📅 Échéance : *15 du mois*
💰 Montant : *50 000 FCFA*

👥 *En attente :*
▫️ Fatou Sow (77 123 45 67)
▫️ Moussa Diop (76 987 65 43)

👉 Réglez en un clic via Wave / OM !`}
              </div>
            </div>
          )}

          {activeFeatureTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-bold">
                  🛡️ Conformité & Sécurité
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Protection des fonds & Arbitrage officiel
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Chaque transaction est enregistrée dans un journal d'audit infalsifiable. En cas de désaccord, un module de médiation et d'arbitrage protège les intérêts des participants.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Chiffrement bancaire TLS 1.3 de bout en bout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Conformité légale données personnelles CDP Sénégal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Reçus numériques horodatés pour chaque versement
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Garantie Denc Xaalis</h4>
                    <p className="text-xs text-slate-500">Traçabilité 100% vérifiable par tous les membres</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'comparison' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                Comparatif : Tontine Traditionnelle vs Denc Xaalis
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                      <th className="py-3 px-4">Critère</th>
                      <th className="py-3 px-4 text-rose-600 font-bold">Cahier & Papier classique</th>
                      <th className="py-3 px-4 text-emerald-600 font-bold">Denc Xaalis Fintech</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3 px-4 font-bold">Transparence des comptes</td>
                      <td className="py-3 px-4 text-slate-500">Seul le gérant a le cahier</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Visible en temps réel par tous les membres
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold">Risque de vol ou perte de liquide</td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">Élevé (manipulation de billets)</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Nul (Paiements Wave / OM directs)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold">Relances de paiement</td>
                      <td className="py-3 px-4 text-slate-500">Appels manuels répétitifs</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Rappels WhatsApp & diffusion en 1 clic
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold">Preuve de versement</td>
                      <td className="py-3 px-4 text-slate-500">Signature sur carnet souvent perdue</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Reçu électronique certifié téléchargeable
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 5. WHATSAPP DIRECT CONTACT BANNER ================= */}
      <section className="p-8 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-3xl border border-emerald-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-md uppercase">
              Support Réactif
            </span>
            <h3 className="text-xl font-bold mt-1">
              Une question ? Rejoignez notre assistance WhatsApp
            </h3>
            <p className="text-xs text-emerald-200">
              L'équipe Denc Xaalis vous répond directement au{' '}
              <strong className="text-white font-mono">+221 70 461 18 94</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            id="banner-btn-wa"
            href="https://wa.me/221704611894?text=Bonjour%20Denc%20Xaalis,%20je%20souhaite%20des%20renseignements"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            Discuter sur WhatsApp (70 461 18 94)
          </a>
        </div>
      </section>
    </div>
  );
};
