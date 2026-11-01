import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone, ShieldCheck, Sparkles, Check, Copy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

const WHATSAPP_PHONE = '221704611894';
const DISPLAY_PHONE = '+221 70 461 18 94';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('general');
  const { t, language } = useLanguage();

  const handleCopy = () => {
    navigator.clipboard.writeText(DISPLAY_PHONE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTopicMessage = (topic: string) => {
    switch (topic) {
      case 'create':
        return language === 'wo'
          ? "Salam Denc Xaalis, bëgg naa xam nan lañuy sosee natt bu bees ci plateforme bi ?"
          : "Bonjour Denc Xaalis, je souhaite avoir de l'aide pour créer et configurer une nouvelle tontine.";
      case 'cotisation':
        return language === 'wo'
          ? "Salam Denc Xaalis, am naa laaj ci wàllu fey càcc ci Wave / Orange Money."
          : "Bonjour Denc Xaalis, j'ai une question concernant une cotisation Wave / Orange Money.";
      case 'payout':
        return language === 'wo'
          ? "Salam, bëgg naa leral ci wàllu ramasaas cagnotte bi ak tiraas bi."
          : "Bonjour Denc Xaalis, je souhaite des précisions sur le tirage au sort et le versement de la cagnotte.";
      default:
        return language === 'wo'
          ? "Salam Denc Xaalis, soxla naa ndimbal ci plateforme bi."
          : "Bonjour Denc Xaalis, j'ai besoin d'une assistance concernant la plateforme d'épargne rotative.";
    }
  };

  const handleOpenWhatsApp = (text?: string) => {
    const messageToSend = text || customMsg.trim() || getTopicMessage(selectedTopic);
    const encoded = encodeURIComponent(messageToSend);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          id="btn-whatsapp-floating"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-700/30 border border-emerald-400/40 transition-all duration-300 transform hover:scale-105 active:scale-95 group font-bold text-xs"
          aria-label={t('whatsappSupport', 'Support WhatsApp')}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 rounded-full" />
          </div>
          <span className="hidden sm:inline tracking-wide">WhatsApp</span>
          <span className="text-[11px] px-1.5 py-0.5 bg-emerald-800/60 rounded-md font-mono hidden md:inline">
            70 461 18 94
          </span>
        </button>
      </div>

      {/* WhatsApp Assistance Drawer / Popover */}
      {isOpen && (
        <div className="fixed bottom-22 left-6 z-50 w-[90vw] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <MessageCircle className="w-5 h-5 fill-white text-emerald-700" />
              </div>
              <div>
                <h4 className="font-black text-sm">Assistance WhatsApp Officielle</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  En ligne • {DISPLAY_PHONE}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 text-xs text-slate-700 dark:text-slate-200">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                {language === 'wo'
                  ? "Jàmm nga am ! Denc Xaalis mu ngi fi pur jàppale la ci sa natt yi ak feyma Wave / Orange Money."
                  : "Bienvenue sur le support direct Denc Xaalis. Posez vos questions à un conseiller dédié."}
              </p>
            </div>

            {/* Quick Topic Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Sujet rapide :
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'general', label: '💬 Question générale / Info tontine' },
                  { id: 'create', label: '➕ Aide création de tontine' },
                  { id: 'cotisation', label: '💳 Problème cotisation Wave / OM' },
                  { id: 'payout', label: '🏆 Tirage & Versement de cagnotte' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTopic(item.id)}
                    className={`px-3 py-2 text-left rounded-xl text-[11px] font-semibold transition-all flex items-center justify-between ${
                      selectedTopic === item.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedTopic === item.id && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1">
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Écrivez votre message personnalisé ici (optionnel)..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Direct Open CTA */}
            <div className="space-y-2 pt-1">
              <button
                id="btn-open-wa-chat"
                onClick={() => handleOpenWhatsApp()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Ouvrir la discussion WhatsApp
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span className="font-mono">{DISPLAY_PHONE}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" /> Copié
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copier numéro
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
