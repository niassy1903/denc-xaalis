import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, ArrowRight } from 'lucide-react';
import { transactionApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF } from '../../utils/formatters.ts';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [montant, setMontant] = useState<number>(25000);
  const [moyenPaiement, setMoyenPaiement] = useState<string>('Wave');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || montant < 1000) {
      setErrorMsg('Le montant minimum de recharge est de 1 000 XOF');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await transactionApi.deposit({ montant, moyenPaiement });
      if (res.success) {
        setSuccessMsg(`Recharge de ${formatXOF(montant)} effectuée avec succès via ${moyenPaiement} !`);
        await refreshUser();
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la recharge');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [10000, 25000, 50000, 100000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl">
              <Wallet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Recharger mon Portefeuille</h3>
              <p className="text-xs text-emerald-200">Solde actuel : {formatXOF(user?.soldePortefeuille)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDeposit} className="p-6 space-y-5">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-100">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Montant à créditer (XOF)
                </label>
                <div className="relative">
                  <input
                    id="input-wallet-amount"
                    type="number"
                    min="1000"
                    step="1000"
                    value={montant}
                    onChange={(e) => setMontant(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">XOF</span>
                </div>

                {/* Preset shortcuts */}
                <div className="grid grid-cols-4 gap-2 mt-2.5">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMontant(amt)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        montant === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Opérateur de paiement mobile
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { name: 'Wave', color: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/50', active: 'border-cyan-600 ring-2 ring-cyan-500 bg-cyan-50 text-cyan-900 font-bold' },
                    { name: 'Orange Money', color: 'border-orange-200 hover:border-orange-400 bg-orange-50/50', active: 'border-orange-600 ring-2 ring-orange-500 bg-orange-50 text-orange-900 font-bold' },
                    { name: 'Free Money', color: 'border-rose-200 hover:border-rose-400 bg-rose-50/50', active: 'border-rose-600 ring-2 ring-rose-500 bg-rose-50 text-rose-900 font-bold' },
                  ].map((op) => (
                    <button
                      key={op.name}
                      type="button"
                      onClick={() => setMoyenPaiement(op.name)}
                      className={`p-3 rounded-2xl border text-center transition-all text-xs font-medium ${
                        moyenPaiement === op.name ? op.active : op.color + ' text-slate-700'
                      }`}
                    >
                      {op.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-confirm-deposit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Traitement du rechargement...' : (
                    <>
                      Confirmer la recharge de {formatXOF(montant)} <ArrowRight className="w-4 h-4" />
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
