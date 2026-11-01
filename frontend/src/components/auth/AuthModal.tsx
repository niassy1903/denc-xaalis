import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User as UserIcon, ShieldCheck, ArrowRight, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CaptchaSecurity } from './CaptchaSecurity.tsx';
import { TermsOfServiceModal } from '../legal/TermsOfServiceModal.tsx';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register form
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [role, setRole] = useState<'membre' | 'president_tontine'>('membre');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Captcha State
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');

  // Modals for legal docs
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isCaptchaValid) {
      setErrorMsg('Veuillez résoudre le test anti-robot CAPTCHA pour sécuriser votre connexion.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Identifiants invalides ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!acceptedTerms) {
      setErrorMsg('Vous devez lire et accepter les Conditions Générales d\'Utilisation pour créer un compte.');
      return;
    }

    if (!isCaptchaValid) {
      setErrorMsg('Veuillez résoudre le test anti-robot CAPTCHA.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nom,
        prenom,
        email: regEmail,
        telephone,
        motDePasse: regPass,
        role,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez vérifier les informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" /> Authentification Réelle & Sécurisée
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Denc Xaalis SN</h2>
            <p className="text-xs text-emerald-200 mt-1">
              {mode === 'login'
                ? 'Accédez à votre espace réel (Email ou Téléphone)'
                : 'Créez votre compte réel avec des rôles et prérogatives bien définis.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-3 text-center transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-900 border-b-2 border-emerald-700 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-3 text-center transition-all ${
                mode === 'register'
                  ? 'bg-white text-emerald-900 border-b-2 border-emerald-700 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Body Form */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email ou Numéro de Téléphone
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="input-login-email"
                      type="text"
                      required
                      placeholder="ex: awa.diallo@dencxaalis.sn ou +221 77 000 00 00"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="input-login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
                </div>

                {/* Anti-Bot Captcha */}
                <CaptchaSecurity
                  onValidated={(valid, answer, token) => {
                    setIsCaptchaValid(valid);
                    setCaptchaAnswer(answer);
                    setCaptchaToken(token);
                  }}
                />

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Connexion en cours...' : (
                    <>
                      Se connecter à Denc Xaalis <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-slate-500">
                  En vous connectant, vous acceptez nos{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    CGU
                  </button>{' '}
                  et notre{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Confidentialité
                  </button>.
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Role selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Type de Compte (Rôle et Permissions)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('membre')}
                      className={`p-2.5 text-left border rounded-xl transition-all ${
                        role === 'membre'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold flex items-center gap-1">
                        👤 Membre Participant
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Adhère et cotise aux tontines</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('president_tontine')}
                      className={`p-2.5 text-left border rounded-xl transition-all ${
                        role === 'president_tontine'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold flex items-center gap-1">
                        👩🏾‍💼 Président de Tontine
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Gère cercles, cycles et tirages</p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom</label>
                    <input
                      id="input-reg-prenom"
                      type="text"
                      required
                      placeholder="Prénom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom</label>
                    <input
                      id="input-reg-nom"
                      type="text"
                      required
                      placeholder="Nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    id="input-reg-email"
                    type="email"
                    required
                    placeholder="ex: nom@domaine.sn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone (Wave / OM)</label>
                  <input
                    id="input-reg-phone"
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
                  <input
                    id="input-reg-password"
                    type="password"
                    required
                    placeholder="Minimum 6 caractères"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Anti-Bot Captcha */}
                <CaptchaSecurity
                  onValidated={(valid, answer, token) => {
                    setIsCaptchaValid(valid);
                    setCaptchaAnswer(answer);
                    setCaptchaToken(token);
                  }}
                />

                {/* Terms of Service & Privacy Policy Acceptance */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      id="checkbox-accept-terms"
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600"
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      J'ai lu et j'accepte expressément les{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-emerald-800 font-bold underline hover:text-emerald-950 inline-flex items-center gap-0.5"
                      >
                        <FileText className="w-3 h-3 inline" /> Conditions Générales d'Utilisation
                      </button>{' '}
                      et la{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-emerald-800 font-bold underline hover:text-emerald-950 inline-flex items-center gap-0.5"
                      >
                        <ShieldCheck className="w-3 h-3 inline" /> Politique de Confidentialité
                      </button>.
                    </span>
                  </label>
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={loading || !acceptedTerms}
                  className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Création en cours...' : (
                    <>
                      Créer mon compte sécurisé <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modals for legal review */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </>
  );
};
