import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, ArrowRight, Wallet, Phone } from 'lucide-react';
import { ICotisation } from '../../types.ts';
import { cotisationApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF } from '../../utils/formatters.ts';
import { triggerConfetti } from '../../utils/formatters.ts';

interface PayCotisationModalProps {
  isOpen: boolean;
  cotisation: ICotisation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayCotisationModal: React.FC<PayCotisationModalProps> = ({
  isOpen,
  cotisation,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const [moyenPaiement, setMoyenPaiement] = useState<string>('Wave');
  const [referencePaiement, setReferencePaiement] = useState<string>('');
  const [telephonePayeur, setTelephonePayeur] = useState(user?.telephone || '+221 77 123 45 67');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !cotisation) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await cotisationApi.payCotisation(cotisation._id, {
        moyenPaiement,
        referencePaiement: referencePaiement || undefined,
        justificatif: `Règlement mobile ${moyenPaiement} via ${telephonePayeur}`,
      });

      if (res.success) {
        triggerConfetti();
        setSuccessMsg(res.message);
        await refreshUser();
        onSuccess();
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const soldeSuffisant = (user?.soldePortefeuille || 0) >= cotisation.montant;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl">
              <CreditCard className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Paiement de Cotisation</h3>
              <p className="text-xs text-emerald-200">
                {(cotisation.tontine as any)?.nom || 'Tontine'} • Tour #{(cotisation.tour as any)?.numeroTour || 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 space-y-4">
          {successMsg ? (
            <div className="p-5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm">Paiement validé avec succès !</h4>
              <p className="text-xs text-emerald-800">{successMsg}</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Amount summary box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Montant à régler</span>
                  <span className="text-xl font-black text-slate-900">{formatXOF(cotisation.montant)}</span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-lg">
                  Statut : Impayé
                </span>
              </div>

              {/* Operator Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Sélectionnez le mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMoyenPaiement('Wave')}
                    className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                      moyenPaiement === 'Wave'
                        ? 'border-cyan-600 ring-2 ring-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🌊 Wave Mobile Money
                  </button>

                  <button
                    type="button"
                    onClick={() => setMoyenPaiement('Orange Money')}
                    className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                      moyenPaiement === 'Orange Money'
                        ? 'border-orange-600 ring-2 ring-orange-500 bg-orange-50 text-orange-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🍊 Orange Money
                  </button>

                  <button
                    type="button"
                    onClick={() => setMoyenPaiement('Free Money')}
                    className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                      moyenPaiement === 'Free Money'
                        ? 'border-rose-600 ring-2 ring-rose-500 bg-rose-50 text-rose-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🔴 Free Money
                  </button>

                  <button
                    type="button"
                    onClick={() => setMoyenPaiement('Portefeuille')}
                    className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                      moyenPaiement === 'Portefeuille'
                        ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    💼 Portefeuille Denc
                  </button>
                </div>
              </div>

              {moyenPaiement === 'Portefeuille' ? (
                <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  soldeSuffisant ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <span>Solde disponible : <strong>{formatXOF(user?.soldePortefeuille)}</strong></span>
                  {!soldeSuffisant && <span className="font-bold text-rose-600">Solde insuffisant</span>}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Numéro de téléphone débité
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={telephonePayeur}
                      onChange={(e) => setTelephonePayeur(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      placeholder="+221 77 000 00 00"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  id="btn-confirm-pay-cotisation"
                  type="submit"
                  disabled={loading || (moyenPaiement === 'Portefeuille' && !soldeSuffisant)}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Validation du paiement...' : (
                    <>
                      Valider le paiement de {formatXOF(cotisation.montant)} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
