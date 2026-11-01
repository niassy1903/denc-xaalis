import React, { useState } from 'react';
import { X, Users, Sparkles, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { tontineApi } from '../../api/api.ts';
import { formatXOF } from '../../utils/formatters.ts';

interface CreateTontineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTontineId?: string) => void;
}

export const CreateTontineModal: React.FC<CreateTontineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [montantCotisation, setMontantCotisation] = useState<number>(25000);
  const [frequence, setFrequence] = useState('mensuelle');
  const [nombreMembresMax, setNombreMembresMax] = useState<number>(5);
  const [regles, setRegles] = useState('Cotisation obligatoire avant le 10 de chaque mois.');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const cagnotteEstimee = montantCotisation * nombreMembresMax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || montantCotisation < 1000 || nombreMembresMax < 2) {
      setErrorMsg('Veuillez renseigner un nom, un montant valide et au moins 2 membres.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await tontineApi.createTontine({
        nom,
        description,
        montantCotisation,
        frequence,
        nombreMembresMax,
        regles,
      });

      if (res.success) {
        onSuccess(res.tontine._id);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la création de la tontine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl">
              <Users className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Créer une nouvelle Tontine</h3>
              <p className="text-xs text-emerald-200">Paramétrez les cotisations, tours et règles du groupe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom de la tontine
            </label>
            <input
              id="input-tontine-name"
              type="text"
              required
              placeholder="ex: Tontine Solidarité Tabaski 2026"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Objectif du groupe
            </label>
            <textarea
              rows={2}
              placeholder="ex: Financement de fonds de commerce ou épargne familiale..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Montant par cotisation (XOF)
              </label>
              <input
                id="input-tontine-amount"
                type="number"
                min="1000"
                step="1000"
                required
                value={montantCotisation}
                onChange={(e) => setMontantCotisation(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Fréquence des tours
              </label>
              <select
                value={frequence}
                onChange={(e) => setFrequence(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                <option value="hebdomadaire">Hebdomadaire (Chaque semaine)</option>
                <option value="bimensuelle">Bimensuelle (Tous les 15 jours)</option>
                <option value="mensuelle">Mensuelle (Chaque mois)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre de membres max
              </label>
              <input
                type="number"
                min="2"
                max="50"
                required
                value={nombreMembresMax}
                onChange={(e) => setNombreMembresMax(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                Cagnotte par tour estimée
              </span>
              <span className="text-lg font-black text-emerald-900">{formatXOF(cagnotteEstimee)}</span>
              <span className="text-[10px] text-emerald-700">
                ({nombreMembresMax} tours au total)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Règles et pénalités de retard
            </label>
            <input
              type="text"
              value={regles}
              onChange={(e) => setRegles(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-confirm-create-tontine"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Création de la tontine...' : (
                <>
                  Créer et générer le code d'invitation <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
