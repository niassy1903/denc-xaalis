import React, { useState } from 'react';
import { X, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';
import { tontineApi } from '../../api/api.ts';

interface JoinTontineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tontineId: string) => void;
}

export const JoinTontineModal: React.FC<JoinTontineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [codeInvitation, setCodeInvitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInvitation.trim()) {
      setErrorMsg('Veuillez saisir un code d\'invitation valide');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await tontineApi.joinTontineByCode(codeInvitation);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess(res.tontineId);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Code d\'invitation introuvable ou tontine complète');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl">
              <QrCode className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Rejoindre une Tontine</h3>
              <p className="text-xs text-emerald-200">Saisissez le code fourni par le président</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  Code d'invitation (Ex : DX-TAB26)
                </label>
                <input
                  id="input-join-code"
                  type="text"
                  required
                  placeholder="DX-XXXXX"
                  value={codeInvitation}
                  onChange={(e) => setCodeInvitation(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono font-bold text-xl tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all uppercase"
                />
              </div>

              {/* Demo shortcuts */}
              <div className="pt-1">
                <p className="text-[11px] text-slate-500 font-medium mb-1.5">Codes d'exemple disponibles :</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCodeInvitation('DX-TAB26')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold"
                  >
                    DX-TAB26 (Tabaski)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeInvitation('DX-DKR26')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold"
                  >
                    DX-DKR26 (Dakar)
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-confirm-join"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Vérification du code...' : (
                    <>
                      Valider et rejoindre la tontine <ArrowRight className="w-4 h-4" />
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
