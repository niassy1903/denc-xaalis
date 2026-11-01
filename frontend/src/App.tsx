import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { LandingPage } from './components/home/LandingPage.tsx';
import { MemberDashboard } from './components/dashboard/MemberDashboard.tsx';
import { TontinesList } from './components/tontines/TontinesList.tsx';
import { TontineDetail } from './components/tontines/TontineDetail.tsx';
import { CotisationsView } from './components/cotisations/CotisationsView.tsx';
import { WalletView } from './components/wallet/WalletView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { CreateTontineModal } from './components/layout/CreateTontineModal.tsx';
import { JoinTontineModal } from './components/layout/JoinTontineModal.tsx';
import { PayCotisationModal } from './components/tontines/PayCotisationModal.tsx';
import { ScrollToTop } from './components/common/ScrollToTop.tsx';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton.tsx';
import { ICotisation } from './types.ts';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedTontineId, setSelectedTontineId] = useState<string | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCreateTontineOpen, setIsCreateTontineOpen] = useState(false);
  const [isJoinTontineOpen, setIsJoinTontineOpen] = useState(false);
  const [payingCotisation, setPayingCotisation] = useState<ICotisation | null>(null);

  const navigateTo = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) setSelectedTontineId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-300">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenCreateTontine={() => {
          if (!user) {
            handleOpenLogin();
          } else {
            setIsCreateTontineOpen(true);
          }
        }}
        onOpenJoinTontine={() => {
          if (!user) {
            handleOpenLogin();
          } else {
            setIsJoinTontineOpen(true);
          }
        }}
        onOpenLoginModal={handleOpenLogin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          /* Dynamic, Illustrative Landing Page */
          <LandingPage
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
            onOpenCreateTontine={() => {
              handleOpenLogin();
            }}
            onOpenJoinTontine={() => {
              handleOpenLogin();
            }}
          />
        ) : (
          /* Authenticated Router Views */
          <div>
            {currentView === 'dashboard' && (
              <MemberDashboard
                onNavigate={navigateTo}
                onOpenCreateTontine={() => setIsCreateTontineOpen(true)}
                onOpenJoinTontine={() => setIsJoinTontineOpen(true)}
                onPayCotisation={(c) => setPayingCotisation(c)}
              />
            )}

            {currentView === 'tontines' && (
              <TontinesList
                onNavigate={navigateTo}
                onOpenCreate={() => setIsCreateTontineOpen(true)}
                onOpenJoin={() => setIsJoinTontineOpen(true)}
              />
            )}

            {currentView === 'tontine_detail' && selectedTontineId && (
              <TontineDetail
                tontineId={selectedTontineId}
                onBack={() => navigateTo('tontines')}
                onNavigate={navigateTo}
              />
            )}

            {currentView === 'cotisations' && (
              <CotisationsView onNavigate={navigateTo} />
            )}

            {currentView === 'wallet' && <WalletView />}

            {currentView === 'admin' && (
              <AdminDashboard onNavigate={navigateTo} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-800 dark:bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              DX
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Denc Xaalis Fintech Sénégal</span>
            <span className="text-slate-400">•</span>
            <span>Épargne rotative digitale & sécurisée (XOF)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span>🌊 Wave SN</span>
            <span>🍊 Orange Money</span>
            <span>🔴 Free Money</span>
            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
              {t('certifiedBceao', 'Certifié conforme BCEAO')}
            </span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Floating Tools */}
      <ScrollToTop />
      <WhatsAppFloatingButton />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />

      <CreateTontineModal
        isOpen={isCreateTontineOpen}
        onClose={() => setIsCreateTontineOpen(false)}
        onSuccess={(id) => {
          if (id) {
            navigateTo('tontine_detail', id);
          } else {
            navigateTo('tontines');
          }
        }}
      />

      <JoinTontineModal
        isOpen={isJoinTontineOpen}
        onClose={() => setIsJoinTontineOpen(false)}
        onSuccess={(id) => {
          navigateTo('tontine_detail', id);
        }}
      />

      <PayCotisationModal
        isOpen={!!payingCotisation}
        cotisation={payingCotisation}
        onClose={() => setPayingCotisation(null)}
        onSuccess={() => {
          navigateTo('cotisations');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
