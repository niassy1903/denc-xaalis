import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, UserCheck, KeyRound } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-900 to-emerald-950 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-teal-500/30 border border-teal-400/40 text-teal-200 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Conformité CDP Sénégal & Normes Bancaires
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-teal-300" />
            Politique de Confidentialité & Sécurité
          </h2>
          <p className="text-xs text-teal-200 mt-1">
            Protection absolue de vos données bancaires, personnelles et transactions de tontines
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <h3 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> 1. Engagement de Protection des Données
            </h3>
            <p className="text-emerald-900/90">
              Denc Xaalis s'engage à respecter scrupuleusement la loi sénégalaise n° 2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel (Commission de Protection des Données Personnelles - CDP). Vos informations financières et personnelles ne sont jamais vendues, cédées ou divulguées à des tiers publicitaires.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-700" /> 2. Données Collectées
            </h3>
            <p className="text-slate-600 mb-2">
              Nous collectons uniquement les éléments strictement nécessaires au bon déroulement de vos tontines et à la prévention des fraudes :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Identité :</strong> Nom, prénom, adresse email et numéro de téléphone mobile.</li>
              <li><strong>Informations Financières :</strong> Historique des cotisations, date des tours de ramassage, méthode de paiement utilisée (Wave, Orange Money) et références de transactions.</li>
              <li><strong>Logs de Connexion :</strong> Adresse IP, date/heure et signature de session pour détecter tout accès suspect.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-emerald-700" /> 3. Chiffrement et Sécurité Technique
            </h3>
            <p className="text-slate-600 mb-2">
              Notre architecture intègre les meilleures pratiques de sécurité contre les cyberattaques :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Hachage Renforcé :</strong> Tous les mots de passe sont hachés avec du sel (Bcrypt à coût élevé) ; aucun mot de passe n'est stocké en clair.</li>
              <li><strong>Chiffrement TLS 1.3 :</strong> Toutes les communications entre votre appareil et nos serveurs sont chiffrées de bout en bout.</li>
              <li><strong>Révocation Immédiate des Tokens :</strong> Dès la déconnexion, les jetons de session (JWT) sont immédiatement blacklistés et révoqués en base de données pour empêcher toute tentative de réutilisation par des pirates.</li>
              <li><strong>Protection Anti-Brute-Force & CAPTCHA :</strong> Systèmes de limitation de requêtes et de détection anti-robots pour contrer les attaques par dictionnaire et robots malveillants.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <EyeOff className="w-4 h-4 text-emerald-700" /> 4. Visibilité des Données au sein des Tontines
            </h3>
            <p className="text-slate-600">
              Au sein d'une tontine spécifique, seuls les membres acceptés peuvent voir le prénom/nom des autres participants ainsi que le statut des cotisations du tour en cours, afin de préserver la confiance mutuelle. Votre mot de passe, vos coordonnées bancaires privées et votre solde global de portefeuille demeurent strictement confidentiels et inaccessibles aux autres membres.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-emerald-700" /> 5. Vos Droits d'Accès et de Rectification
            </h3>
            <p className="text-slate-600">
              Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données personnelles. Vous pouvez exercer ces droits à tout moment depuis votre profil ou en contactant notre délégué à la protection des données à <em>contact@dencxaalis.sn</em>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
