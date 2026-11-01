import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { ITransaction } from '../../types.ts';
import { transactionApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF, formatDateTime } from '../../utils/formatters.ts';
import { WalletModal } from '../layout/WalletModal.tsx';

export const WalletView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getMyTransactions();
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDepositSuccess = async () => {
    await refreshUser();
    await fetchTransactions();
  };

  const totalDepot = transactions
    .filter((t) => t.type === 'depot' && t.statut === 'succes')
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  const totalGainTontine = transactions
    .filter((t) => t.type === 'gain_tontine' && t.statut === 'succes')
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  const totalCotise = transactions
    .filter((t) => t.type === 'cotisation' && t.statut === 'succes')
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Portefeuille Digital Denc Xaalis
            </span>
            <p className="text-xs text-emerald-200 uppercase font-semibold tracking-wider">Solde Disponible</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              {formatXOF(user?.soldePortefeuille)}
            </h1>
            <p className="text-xs text-emerald-200 mt-2">
              Utilisable instantanément pour cotiser ou recevoir vos cagnottes de tours.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-open-deposit-wallet"
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-2xl text-xs font-black transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Recharger le solde (Wave / OM)
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recharges directes</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{formatXOF(totalDepot)}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Wave & Orange Money</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cagnottes perçues</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{formatXOF(totalGainTontine)}</h3>
            <span className="text-[10px] text-teal-600 font-medium">Gains de tours de tontine</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cotisations versées</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{formatXOF(totalCotise)}</h3>
            <span className="text-[10px] text-indigo-600 font-medium">Participation aux groupes</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Historique des Opérations Financières</h3>
            <p className="text-xs text-slate-500">Traçabilité complète de vos flux de trésorerie</p>
          </div>
          <button
            onClick={fetchTransactions}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Chargement des transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Aucune transaction enregistrée sur votre portefeuille.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Type & Référence</th>
                  <th className="pb-3 px-3">Moyen de paiement</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Statut</th>
                  <th className="pb-3 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'depot' || tx.type === 'gain_tontine';

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-bold text-slate-900 capitalize">
                            {tx.type === 'depot'
                              ? '📥 Recharge de solde'
                              : tx.type === 'gain_tontine'
                              ? '🏆 Cagnotte reçue'
                              : tx.type === 'cotisation'
                              ? '💳 Cotisation tontine'
                              : tx.type}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">{tx.reference}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                          {tx.moyenPaiement}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          Succès
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-black text-sm ${
                            isCredit ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isCredit ? '+' : '-'} {formatXOF(tx.montant)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={handleDepositSuccess}
      />
    </div>
  );
};
