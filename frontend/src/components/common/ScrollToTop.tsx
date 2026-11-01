import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 240) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      id="btn-scroll-to-top"
      onClick={scrollToTop}
      aria-label={t('scrollTop', 'Haut de page')}
      className="fixed bottom-6 right-6 z-40 p-3.5 bg-slate-900/90 hover:bg-slate-900 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-2xl shadow-xl shadow-slate-900/20 backdrop-blur-md border border-slate-700/50 dark:border-emerald-400/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group flex items-center justify-center"
      title={t('scrollTop', 'Remonter en haut')}
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform text-emerald-400 dark:text-white" />
    </button>
  );
};
