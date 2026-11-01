import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Bot, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/api.ts';

interface CaptchaSecurityProps {
  onValidated: (isValid: boolean, answer: string, token: string) => void;
  required?: boolean;
}

export const CaptchaSecurity: React.FC<CaptchaSecurityProps> = ({ onValidated, required = true }) => {
  const [question, setQuestion] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [localExpected, setLocalExpected] = useState<number | null>(null);
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchOrGenerateCaptcha = async () => {
    setUserAnswer('');
    setIsValidated(false);
    onValidated(false, '', '');
    setLoading(true);

    try {
      const response = await apiClient.get('/auth/captcha');
      if (response.data?.question && response.data?.token) {
        setQuestion(response.data.question);
        setCaptchaToken(response.data.token);
        setLocalExpected(null);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback local challenge
    }

    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const isSum = Math.random() > 0.3;
    if (isSum) {
      setQuestion(`Combien font ${a} + ${b} ?`);
      setLocalExpected(a + b);
    } else {
      const max = Math.max(a, b);
      const min = Math.min(a, b);
      setQuestion(`Combien font ${max} - ${min} ?`);
      setLocalExpected(max - min);
    }
    setCaptchaToken('local_' + Date.now());
    setLoading(false);
  };

  useEffect(() => {
    fetchOrGenerateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);

    if (localExpected !== null) {
      const valid = parseInt(val.trim(), 10) === localExpected;
      setIsValidated(valid);
      onValidated(valid, val.trim(), captchaToken);
    } else {
      const valid = val.trim().length > 0;
      setIsValidated(valid);
      onValidated(valid, val.trim(), captchaToken);
    }
  };

  return (
    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Bot className="w-4 h-4 text-emerald-700" />
          <span>Vérification Anti-Robot (CAPTCHA)</span>
        </div>
        <button
          type="button"
          onClick={fetchOrGenerateCaptcha}
          disabled={loading}
          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
          title="Changer de calcul"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 flex items-center justify-between select-none shadow-2xs">
          <span>{question || 'Chargement du défi...'}</span>
          <span className="text-[10px] text-slate-400 font-normal">=</span>
        </div>
        <div className="w-24 relative">
          <input
            id="captcha-input-answer"
            type="number"
            required={required}
            placeholder="Réponse"
            value={userAnswer}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-xs font-bold bg-white border rounded-xl text-center focus:outline-none focus:ring-2 transition-all ${
              isValidated
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800'
                : 'border-slate-300 focus:ring-emerald-600 focus:border-emerald-600 text-slate-800'
            }`}
          />
          {isValidated && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute right-2 top-2.5 pointer-events-none" />
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
        Sécurité anti-attaque par force brute et scripts automatisés
      </p>
    </div>
  );
};
