import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { ICotisation } from '../../types.ts';
import { cotisationApi } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatXOF, formatDate, formatDateTime } from '../../utils/formatters.ts';
import { PayCotisationModal } from '../tontines/PayCotisationModal.tsx';

interface CotisationsViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const CotisationsView: React.FC<CotisationsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [cotisations, setCotisations] = useState<ICotisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paye' | 'impaye' | 'en_retard'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<ICotisation | null>(null);
  const [payingCotisation, setPayingCotisation] = useState<ICotisation | null>(null);

  const fetchCotisations = async () => {
    try {
      setLoading(true);
      const res = await cotisationApi.getMyCotisations();
      if (res.success) {
        setCotisations(res.cotisations);
      }
    } catch (err) {
      console.error('Error fetching cotisations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotisations();
  }, []);

  const filtered = cotisations.filter((c) => {
    if (filter === 'all') return true;
    return c.statut === filter;
  });

  const totalPaye = cotisations
    .filter((c) => c.statut === 'paye')
    .reduce((sum, c) => sum + (c.montant || 0), 0);

  const totalAttente = cotisations
    .filter((c) => c.statut === 'impaye' || c.statut === 'en_retard')
    .reduce((sum, c) => sum + (c.montant || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mes Cotisations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique de tous vos versements et cagnottes rotatives
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Réglé</span>
          <h3 className="text-xl font-black text-emerald-900 mt-1">{formatXOF(totalPaye)}</h3>
          <span className="text-[10px] text-emerald-600 font-medium">
            {cotisations.filter((c) => c.statut === 'paye').length} cotisations validées
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">En Attente / Retard</span>
          <h3 className="text-xl font-black text-amber-900 mt-1">{formatXOF(totalAttente)}</h3>
          <span className="text-[10px] text-amber-600 font-medium">
            {cotisations.filter((c) => c.statut !== 'paye').length} échéances à honorer
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Taux de Ponctualité</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {cotisations.length > 0
              ? `${Math.round((cotisations.filter((c) => c.statut === 'paye').length / cotisations.length) * 100)}%`
              : '100%'}
          </h3>
          <span className="text-[10px] text-teal-600 font-medium">Score de confiance Denc Xaalis</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex gap-2">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'impaye', label: 'À régler' },
          { id: 'paye', label: 'Payées' },
          { id: 'en_retard', label: 'En retard' },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setFilter(tabItem.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tabItem.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Chargement des cotisations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Aucune cotisation dans cette catégorie.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Tontine</th>
                  <th className="pb-3 px-3">Tour</th>
                  <th className="pb-3 px-3">Montant</th>
                  <th className="pb-3 px-3">Échéance</th>
                  <th className="pb-3 px-3">Mode de paiement</th>
                  <th className="pb-3 px-3">Statut</th>
                  <th className="pb-3 px-3 text-right">Reçu / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {filtered.map((c) => {
                  const tontineObj = c.tontine as any;
                  const tourObj = c.tour as any;
                  const isPaid = c.statut === 'paye';

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => onNavigate('tontine_detail', tontineObj?._id)}
                          className="font-bold text-slate-900 hover:text-emerald-800 text-left hover:underline"
                        >
                          {tontineObj?.nom || 'Tontine'}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                          Tour #{tourObj?.numeroTour || 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{formatXOF(c.montant)}</td>
                      <td className="py-3.5 px-3 text-slate-500">{formatDate(c.dateEcheance)}</td>
                      <td className="py-3.5 px-3">
                        {isPaid ? (
                          <div>
                            <span className="font-bold text-slate-800">{c.moyenPaiement || 'Wave'}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {c.referencePaiement || 'Auto'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.statut === 'en_retard'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? 'Payé' : c.statut === 'en_retard' ? 'En retard' : 'Impayé'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {isPaid ? (
                          <button
                            id={`btn-receipt-${c._id}`}
                            onClick={() => setSelectedReceipt(c)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-700" /> Reçu
                          </button>
                        ) : (
                          <button
                            id={`btn-pay-${c._id}`}
                            onClick={() => setPayingCotisation(c)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[11px] transition-all shadow-xs"
                          >
                            Payer (Wave/OM)
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      <PayCotisationModal
        isOpen={!!payingCotisation}
        cotisation={payingCotisation}
        onClose={() => setPayingCotisation(null)}
        onSuccess={fetchCotisations}
      />

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-8 space-y-6 relative print:p-0 print:border-none print:shadow-none">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-all print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="inline-flex p-3 bg-emerald-100 rounded-2xl text-emerald-800 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Reçu Officiel de Cotisation</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Réf : {selectedReceipt.referencePaiement || `REC-${selectedReceipt._id.slice(-8).toUpperCase()}`}
              </p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tontine :</span>
                <span className="font-bold text-slate-900">{(selectedReceipt.tontine as any)?.nom}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tour de collecte :</span>
                <span className="font-bold text-slate-900">
                  Tour #{(selectedReceipt.tour as any)?.numeroTour || 1}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Membre cotisant :</span>
                <span className="font-bold text-slate-900">{user?.prenom} {user?.nom}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date du règlement :</span>
                <span className="font-bold text-slate-900">{formatDateTime(selectedReceipt.datePaiement)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Opérateur :</span>
                <span className="font-bold text-slate-900">{selectedReceipt.moyenPaiement}</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 rounded-xl px-3 mt-2">
                <span className="font-bold text-emerald-950">Montant versé :</span>
                <span className="font-black text-base text-emerald-900">{formatXOF(selectedReceipt.montant)}</span>
              </div>
            </div>

            {/* Security stamp */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-mono">
                Transaction cryptée et certifiée conforme par le protocole Denc Xaalis SN.
              </p>
            </div>

            {/* Receipt Actions */}
            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimer / PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
