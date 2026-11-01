import React, { useState } from 'react';
import {
  Coins,
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  ShieldCheck,
  LogOut,
  PlusCircle,
  QrCode,
  ChevronDown,
  LogIn,
  Sun,
  Moon,
  Globe,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../../context/LanguageContext.tsx';
import { formatXOF } from '../../utils/formatters.ts';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import { WalletModal } from './WalletModal.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenCreateTontine: () => void;
  onOpenJoinTontine: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreateTontine,
  onOpenJoinTontine,
  onOpenLoginModal,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t, currentLanguage, languages } = useLanguage();

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Role-based Navigation Configuration
  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { id: 'admin', label: t('adminBackOffice', 'Back Office Admin'), icon: ShieldCheck },
        { id: 'tontines', label: t('allTontines', 'Toutes les Tontines'), icon: Users },
        { id: 'wallet', label: t('myWallet', 'Trésorerie & Solde'), icon: Wallet },
      ];
    }

    if (user.role === 'president_tontine') {
      return [
        { id: 'dashboard', label: t('dashboard', 'Tableau de bord'), icon: LayoutDashboard },
        { id: 'tontines', label: t('myTontines', 'Mes Tontines Gérées'), icon: Users },
        { id: 'cotisations', label: t('myCotisations', 'Suivi Cotisations'), icon: CreditCard },
        { id: 'wallet', label: t('myWallet', 'Mon Portefeuille'), icon: Wallet },
      ];
    }

    // Role: membre
    return [
      { id: 'dashboard', label: t('dashboard', 'Tableau de bord'), icon: LayoutDashboard },
      { id: 'tontines', label: t('myTontines', 'Mes Tontines'), icon: Users },
      { id: 'cotisations', label: t('myCotisations', 'Mes Cotisations'), icon: CreditCard },
      { id: 'wallet', label: t('myWallet', 'Mon Portefeuille'), icon: Wallet },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-5">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate(user ? (user.role === 'admin' ? 'admin' : 'dashboard') : 'dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 dark:from-emerald-600 dark:to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  Denc Xaalis
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    Sénégal
                  </span>
                </span>
                <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {t('brandTagline', 'Épargne rotative certifiée')}
                </span>
              </div>
            </button>

            {/* Desktop Role-Based Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => onNavigate(item.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold border border-emerald-200/50 dark:border-emerald-800'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Tools: Language, Dark Mode, Wallet, User */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 1. Language Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-lang-selector"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
                title={t('translate', 'Changer de langue')}
              >
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="hidden sm:inline font-mono uppercase text-[11px] font-bold">
                  {currentLanguage.code}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-1.5 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t('translate', 'Langue')} (5 Langues)
                    </div>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                          language === l.code
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{l.flag}</span>
                          <span>{l.nativeName}</span>
                        </div>
                        {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 2. Dark / Light Mode Switcher */}
            <button
              id="btn-toggle-dark-mode"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
              title={isDark ? t('lightMode', 'Passer en mode clair') : t('darkMode', 'Passer en mode sombre')}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Authenticated User or Login CTA */}
            {user ? (
              <>
                {/* Role-Specific Action Buttons */}
                <div className="hidden lg:flex items-center gap-2">
                  {user.role !== 'admin' && (
                    <button
                      id="btn-join-tontine-nav"
                      onClick={onOpenJoinTontine}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      {t('joinWithCode', 'Rejoindre (Code)')}
                    </button>
                  )}

                  <button
                    id="btn-create-tontine-nav"
                    onClick={onOpenCreateTontine}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
                    {t('createTontine', 'Créer Tontine')}
                  </button>
                </div>

                {/* Wallet Balance Pill */}
                <button
                  id="btn-open-wallet"
                  onClick={() => setIsWalletOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 transition-all text-xs font-bold"
                  title="Solde du portefeuille - Cliquer pour recharger ou retirer"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{formatXOF(user.soldePortefeuille)}</span>
                  <span className="sm:hidden font-mono">{(user.soldePortefeuille || 0) / 1000}k</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                {/* Notifications */}
                <NotificationDropdown onNavigate={onNavigate} />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    id="btn-user-menu"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700"
                  >
                    {user.photoProfil ? (
                      <img
                        src={user.photoProfil}
                        alt={user.prenom}
                        className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-600/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {user.prenom?.[0]}
                        {user.nom?.[0]}
                      </div>
                    )}
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold capitalize flex items-center gap-1">
                        {user.role === 'admin' && <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />}
                        {user.role === 'president_tontine'
                          ? 'Président Tontine'
                          : user.role === 'admin'
                          ? 'Super Admin'
                          : 'Membre Client'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-2 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {user.prenom} {user.nom}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{user.telephone}</p>
                          <div className="mt-2 flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              {user.role === 'admin'
                                ? '👑 Super Admin'
                                : user.role === 'president_tontine'
                                ? '👩🏾‍💼 Président'
                                : '👤 Membre'}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium rounded-md">
                              Compte Réel
                            </span>
                          </div>
                        </div>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              onNavigate('admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {t('adminBackOffice', 'Accéder au Back Office')}
                          </button>
                        )}

                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            id="navbar-btn-logout"
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-2 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" /> {t('logout', 'Se déconnecter')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-login-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t('loginRegister', 'Connexion / Inscription')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </header>
  );
};
