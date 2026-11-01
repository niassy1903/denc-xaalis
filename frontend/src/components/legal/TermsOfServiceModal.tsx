import React from 'react';
import { X, FileText, CheckCircle, Scale, AlertCircle } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3 h-3" /> Cadre Juridique & Financier
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-300" />
            Conditions Générales d'Utilisation (CGU)
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Dernière mise à jour : 15 Août 2026 — Plateforme Denc Xaalis Sénégal
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" /> 1. Objet et Définition de la Plateforme
            </h3>
            <p className="text-slate-600">
              La plateforme <strong>Denc Xaalis</strong> est une solution numérique sénégalaise d'intermédiation et de gestion sécurisée des tontines rotatives traditionnelles (Natt). Elle fournit des outils technologiques permettant d'automatiser les cotisations, le tirage au sort certifié, la distribution des cagnottes et la résolution transparente des litiges entre membres d'un même cercle de confiance.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
              2. Éligibilité et Inscription des Membres
            </h3>
            <p className="text-slate-600 mb-2">
              Pour s'inscrire et participer à une tontine sur Denc Xaalis, chaque utilisateur doit :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Être une personne physique majeure ou une entité légalement constituée au Sénégal ou dans l'espace UEMOA.</li>
              <li>Fournir une identité réelle et un numéro de téléphone mobile actif lié à un portefeuille agréé (Wave, Orange Money, Free Money).</li>
              <li>S'engager formellement à honorer la totalité de ses échéances de cotisations jusqu'au terme du cycle de la tontine.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
              3. Rôle du Président de Tontine et Responsabilités
            </h3>
            <p className="text-slate-600 mb-2">
              L'initiateur qui crée une tontine en devient le <strong>Président statutaire</strong>. Il est investi des prérogatives de gouvernance suivantes :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Définition du montant de la cotisation unitaire, de la fréquence et du nombre maximal de participants.</li>
              <li>Validation des adhésions et attribution des rôles internes (Secrétaire, Trésorier).</li>
              <li>Ordonnancement des tirages au sort équitables ou de l'ordre d'attribution par consensus.</li>
              <li>Validation des preuves de cotisations et autorisation des déblocages de cagnottes vers le bénéficiaire du tour.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <h3 className="font-bold text-amber-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-700" /> 4. Engagement Financier, Retards et Pénalités
            </h3>
            <p className="text-amber-900/90 mb-2">
              Tout retard de cotisation à la date d'échéance convenue nuit directement au bénéficiaire désigné du tour :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              <li>Des notifications de rappel sont envoyées 48h et 24h avant l'échéance.</li>
              <li>En cas de défaillance non justifiée, une pénalité forfaitaire paramétrée par la tontine peut être imputée sur le solde de l'adhérent.</li>
              <li>La tontine se réserve le droit de révoquer l'ordre de passage ou d'exclure un membre récidiviste après médiation.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
              5. Sécurité des Transactions et Traçabilité
            </h3>
            <p className="text-slate-600">
              Chaque mouvement financier (recharge, cotisation, versement de cagnotte, retrait) génère une référence unique infalsifiable inscrite dans le journal d'audit immuable de la plateforme. Les fonds transitent via les passerelles mobiles agréées par la Banque Centrale des États de l'Afrique de l'Ouest (BCEAO).
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
              6. Résolution des Litiges et Arbitrage
            </h3>
            <p className="text-slate-600">
              En cas de désaccord entre membres ou avec le bureau de la tontine, un litige peut être ouvert directement dans l'application. L'équipe d'administration Denc Xaalis agit en tiers de confiance et arbitre selon les règles initialement établies lors de la création de la tontine.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            J'ai compris et j'accepte
          </button>
        </div>
      </div>
    </div>
  );
};
