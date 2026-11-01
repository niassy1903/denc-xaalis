import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'fr' | 'wo' | 'en' | 'ar' | 'es';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'wo', label: 'Wolof', nativeName: 'Wolof (Senegaal)', flag: '🇸🇳', dir: 'ltr' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'Arabe', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', label: 'Español', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

export const translations: Record<LanguageCode, Record<string, string>> = {
  fr: {
    // Nav & General
    brandTagline: 'Épargne rotative certifiée',
    dashboard: 'Tableau de bord',
    myTontines: 'Mes Tontines',
    myCotisations: 'Mes Cotisations',
    myWallet: 'Mon Portefeuille',
    allTontines: 'Toutes les Tontines',
    adminBackOffice: 'Back Office Admin',
    loginRegister: 'Connexion / Inscription',
    joinWithCode: 'Rejoindre (Code)',
    createTontine: 'Créer Tontine',
    logout: 'Se déconnecter',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    translate: 'Langue',
    scrollTop: 'Haut de page',
    whatsappSupport: 'Support WhatsApp',
    
    // Landing Page
    heroBadge: 'Plateforme Officielle Denc Xaalis SN',
    heroTitle1: "L'Épargne Rotative Moderne,",
    heroTitleHighlight: 'Transparente & Sécurisée',
    heroDesc: 'Gérez vos tontines (Natt) en toute confiance. Automatisez les cotisations via Wave et Orange Money, suivez l\'ordre des bénéficiaires et sécurisez chaque tour de collecte au Sénégal.',
    loginCta: 'Connexion à mon compte',
    registerCta: 'Créer un compte gratuit',
    exploreSimulator: 'Tester le Simulateur',
    
    // Highlights & Features
    waveOmTitle: 'Paiements Wave & Orange Money',
    waveOmDesc: 'Réglez vos cotisations mensuelles en un clic via les opérateurs de mobile money du Sénégal ou votre solde digital.',
    fairDrawTitle: 'Tirage & Ordre Transparent',
    fairDrawDesc: 'Tirage au sort automatisé ou par consensus avec calendrier prévisionnel des versements et notifications automatiques.',
    auditTitle: 'Sécurité & Back Office',
    auditDesc: 'Espace d\'arbitrage des litiges, reçus de paiement certifiés téléchargeables et journalisation d\'audit immuable.',
    
    // WhatsApp Reminders
    whatsappReminder: 'Rappel WhatsApp',
    globalWhatsappReminder: 'Rappel Global WhatsApp',
    sendReminder: 'Envoyer rappel',
    broadcastList: 'Liste de diffusion automatique',
    allUnpaidMembers: 'Tous les membres impayés',
    reminderMessagePrompt: 'Message pré-rempli pour WhatsApp :',
    copyBroadcastText: 'Copier le message groupé',
    quickPing: 'Envoyer un par un',
    statusSent: 'Envoyé',
    statusPending: 'En attente',
    
    // Simulator
    simTitle: 'Simulateur de Cagnotte Natt',
    simSub: 'Calculez instantanément les gains de votre cercle d\'épargne',
    membersCount: 'Nombre de membres',
    contributionAmount: 'Cotisation par membre (FCFA)',
    cycleDuration: 'Durée totale du cycle',
    totalPotPerRound: 'Cagnotte par tour',
    totalCirculating: 'Volume total brassé',
    
    // Steps
    step1Title: '1. Création de Tontine',
    step1Desc: 'Définissez le montant, la fréquence et invitez vos proches avec un code secret unique.',
    step2Title: '2. Cotisations Sécurisées',
    step2Desc: 'Chaque membre cotise par Wave, Orange Money ou son solde avec génération de reçu certifié.',
    step3Title: '3. Attribution Impartiale',
    step3Desc: 'Tirage au sort transparent ou ordre fixé d\'avance selon les accords du cercle.',
    step4Title: '4. Versement Instantané',
    step4Desc: 'Le bénéficiaire du tour reçoit l\'intégralité de la cagnotte directement sur son portefeuille.',
    
    // Testimonials & Trust
    trustedBy: 'Reconnu et utilisé par plus de 15 000 épargnants au Sénégal',
    certifiedBceao: 'Conforme aux standards financiers BCEAO',
    chatWithSupport: 'Besoin d\'aide ? Discutez avec le support Denc Xaalis au +221 70 461 18 94',
    fastSupport: 'Réponse en moins de 5 minutes',
  },
  wo: {
    // Wolof (Senegal)
    brandTagline: 'Natt bu wóor te leer ci Senegaal',
    dashboard: 'Tàbbalu xibaar',
    myTontines: 'Sama Natt yi',
    myCotisations: 'Sama Càcc yi',
    myWallet: 'Sama Porsot bi',
    allTontines: 'Natt yépp',
    adminBackOffice: 'Kër kilifa yi',
    loginRegister: 'Dugg / Bindu ci Denc Xaalis',
    joinWithCode: 'Bokk (Kood)',
    createTontine: 'Sos Natt bu bees',
    logout: 'Génn',
    darkMode: 'Melokaan bu lëndëm',
    lightMode: 'Melokaan bu leer',
    translate: 'Làkk',
    scrollTop: 'Dellu kaw',
    whatsappSupport: 'WhatsApp Denc Xaalis',
    
    // Landing Page
    heroBadge: 'Denc Xaalis Sénégal - Natt bu gën a wóor',
    heroTitle1: 'Denc sa xaalis ci jam,',
    heroTitleHighlight: 'Natt bu leer te dëgër',
    heroDesc: 'Géréel sa natt ci kóllëre ak wóor. Feyeel sa càcc ci Wave ak Orange Money, xam sa bisu ramasaas te bañ a jàq ci natt yi.',
    loginCta: 'Dugg ci sama kont',
    registerCta: 'Bindu ci jam (Amul fey)',
    exploreSimulator: 'Saytu natt bi léegi',
    
    // Highlights
    waveOmTitle: 'Peyma Wave ak Orange Money',
    waveOmDesc: 'Feyeel sa càcc ci benn klig ci Wave mbaa Orange Money te am risi bu wóor.',
    fairDrawTitle: 'Tiraas bu leer nàññ',
    fairDrawDesc: 'Tiraas ordinatëer bu amul càxaan ak wone ku wara jot ci bis bi.',
    auditTitle: 'Kaaraange ak Kër kilifa',
    auditDesc: 'Mbootaay bu wóor te amul nàcc-nàcc ci xaalis bi.',
    
    // WhatsApp
    whatsappReminder: 'Fàttali ci WhatsApp',
    globalWhatsappReminder: 'Fàttali ñépp ci WhatsApp',
    sendReminder: 'Yónnee fàttali',
    broadcastList: 'Limu yónnee ñépp',
    allUnpaidMembers: 'Ñi feyagul ñépp',
    reminderMessagePrompt: 'Bataaxal bu waaj pur WhatsApp :',
    copyBroadcastText: 'Duppil bataaxal bi',
    quickPing: 'Yónnee benn-benn',
    statusSent: 'Yónnee nañ ko',
    statusPending: 'Mu ngi ci xaar',
    
    // Simulator
    simTitle: 'Natt bu natt sa xaalis',
    simSub: 'Xam fi ak léegi ñaata ngay jot bu sa ramasaas jotee',
    membersCount: 'Limu nit ñi',
    contributionAmount: 'Càcc gu nekk (FCFA)',
    cycleDuration: 'Diir bi muy def',
    totalPotPerRound: 'Cagnotte gu nekk',
    totalCirculating: 'Xaalis bu ciy wër',
    
    // Steps
    step1Title: '1. Sos sa Natt',
    step1Desc: 'Tann montant bi, diir bi te woo sa xarit yi ci kood bi.',
    step2Title: '2. Feye sa càcc',
    step2Desc: 'Kow ci Wave, Orange Money walla sa porsot ci jam.',
    step3Title: '3. Tiraas bu leer',
    step3Desc: 'Tiraas ci jam ak sutura ku wara njëkk a jot.',
    step4Title: '4. Ramasaas sa cagnotte',
    step4Desc: 'Ki jot ci bis bi dina jël bépp xaalis bi ci porsotam.',
    
    // Testimonials
    trustedBy: 'Lu ëpp 15,000 nit ñu ngi koy jëfandikoo ci Senegaal',
    certifiedBceao: 'Mbooloo mu dëppook sàrti BCEAO',
    chatWithSupport: 'Soo soxlaa ndimbal, woowal nu ci WhatsApp +221 70 461 18 94',
    fastSupport: 'Tontu ci 5 simili',
  },
  en: {
    // English
    brandTagline: 'Certified Rotating Savings',
    dashboard: 'Dashboard',
    myTontines: 'My Tontines',
    myCotisations: 'My Payments',
    myWallet: 'My Wallet',
    allTontines: 'All Tontines',
    adminBackOffice: 'Admin Back Office',
    loginRegister: 'Sign In / Sign Up',
    joinWithCode: 'Join (Code)',
    createTontine: 'Create Tontine',
    logout: 'Sign Out',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    translate: 'Language',
    scrollTop: 'Back to top',
    whatsappSupport: 'WhatsApp Support',
    
    // Landing
    heroBadge: 'Official Denc Xaalis Senegal Platform',
    heroTitle1: 'Modern Rotating Savings,',
    heroTitleHighlight: 'Transparent & Secure',
    heroDesc: 'Manage rotating savings (Tontine / ROSCA) with total trust. Automate contributions via Wave & Orange Money, track payout turns, and secure every collection cycle.',
    loginCta: 'Sign in to my account',
    registerCta: 'Create a free account',
    exploreSimulator: 'Try the Simulator',
    
    // Highlights
    waveOmTitle: 'Wave & Orange Money Payments',
    waveOmDesc: 'Pay your monthly rounds in one click via Senegal mobile money operators or your digital wallet.',
    fairDrawTitle: 'Fair & Transparent Draw',
    fairDrawDesc: 'Automated unbiased lottery draw or pre-arranged payout calendar with instant alerts.',
    auditTitle: 'Security & Audit Logs',
    auditDesc: 'Certified dispute mediation, downloadable transaction receipts, and immutable audit logs.',
    
    // WhatsApp
    whatsappReminder: 'WhatsApp Reminder',
    globalWhatsappReminder: 'Global WhatsApp Reminder',
    sendReminder: 'Send reminder',
    broadcastList: 'Automatic Broadcast List',
    allUnpaidMembers: 'All unpaid members',
    reminderMessagePrompt: 'Pre-composed WhatsApp message:',
    copyBroadcastText: 'Copy group message',
    quickPing: 'Send one by one',
    statusSent: 'Sent',
    statusPending: 'Pending',
    
    // Simulator
    simTitle: 'Rotating Pot Simulator',
    simSub: 'Instantly calculate payouts and rotations for your savings circle',
    membersCount: 'Number of members',
    contributionAmount: 'Contribution per member (XOF)',
    cycleDuration: 'Total cycle duration',
    totalPotPerRound: 'Pot per round',
    totalCirculating: 'Total circulating volume',
    
    // Steps
    step1Title: '1. Create Tontine',
    step1Desc: 'Set amount, frequency, and invite trusted circle with a unique secret code.',
    step2Title: '2. Secure Contributions',
    step2Desc: 'Each member contributes via Wave, Orange Money, or digital wallet with instant receipts.',
    step3Title: '3. Impartial Draw',
    step3Desc: 'Transparent random lottery or agreed order with verifiable integrity.',
    step4Title: '4. Instant Payout',
    step4Desc: 'The turn winner receives the full collected pot directly in their mobile wallet.',
    
    // Trust
    trustedBy: 'Trusted by over 15,000 savers across Senegal',
    certifiedBceao: 'Compliant with BCEAO financial safety standards',
    chatWithSupport: 'Need assistance? Chat with Denc Xaalis support at +221 70 461 18 94',
    fastSupport: 'Replies in under 5 minutes',
  },
  ar: {
    // Arabic
    brandTagline: 'الادخار الدوري الموثق في السنغال',
    dashboard: 'لوحة التحكم',
    myTontines: 'جمعياتي (الطونتين)',
    myCotisations: 'مساهماتي',
    myWallet: 'محفظتي الرقمية',
    allTontines: 'جميع الجمعيات',
    adminBackOffice: 'إدارة النظام',
    loginRegister: 'تسجيل الدخول / فتح حساب',
    joinWithCode: 'انضمام (بالرمز)',
    createTontine: 'إنشاء جمعية جديدة',
    logout: 'تسجيل الخروج',
    darkMode: 'الوضع الليلي',
    lightMode: 'الوضع النهاري',
    translate: 'اللغة',
    scrollTop: 'إلى الأعلى',
    whatsappSupport: 'دعم واتساب',
    
    // Landing
    heroBadge: 'المنصة الرسمية دينك خالص السنغال',
    heroTitle1: 'الادخار الدوري التكافلي الحديث،',
    heroTitleHighlight: 'شفافية وأمان موثق',
    heroDesc: 'قم بإدارة جمعيات الادخار (الطونتين) بكل ثقة. دفع المساهمات عبر Wave و Orange Money وتحديد أدوار الاستلام بأمان تام في السنغال.',
    loginCta: 'الدخول إلى حسابي',
    registerCta: 'إنشاء حساب مجاني',
    exploreSimulator: 'تجربة حاسبة الادخار',
    
    // Highlights
    waveOmTitle: 'دفع فوري عبر Wave و Orange Money',
    waveOmDesc: 'سداد الاشتراكات الشهرية بنقرة واحدة عبر المحافظ الإلكترونية السنغالية.',
    fairDrawTitle: 'قرعة نزيهة وجدول شفاف',
    fairDrawDesc: 'سحب آلي عادل للأدوار وتتبع مواعيد استلام المبالغ مع تنبيهات فورية.',
    auditTitle: 'أمان وسجل تدقيق رسمي',
    auditDesc: 'حل النزاعات وإيصالات دفع معتمدة وسجلات غير قابلة للتعديل.',
    
    // WhatsApp
    whatsappReminder: 'تذكير واتساب',
    globalWhatsappReminder: 'تذكير جماعي عبر واتساب',
    sendReminder: 'إرسال التذكير',
    broadcastList: 'قائمة البث الجماعي الآلي',
    allUnpaidMembers: 'جميع الأعضاء غير المسددين',
    reminderMessagePrompt: 'نص الرسالة المجهزة لواتساب:',
    copyBroadcastText: 'نسخ الرسالة الجماعية',
    quickPing: 'إرسال فردي سريع',
    statusSent: 'تم الإرسال',
    statusPending: 'في الانتظار',
    
    // Simulator
    simTitle: 'حاسبة أرباح الطونتين',
    simSub: 'احسب فوراً مبالغ الاستلام ودورات الادخار لمجموعتك',
    membersCount: 'عدد الأعضاء',
    contributionAmount: 'مساهمة كل عضو (فرنك غرب إفريقيا)',
    cycleDuration: 'مدة الدورة الإجمالية',
    totalPotPerRound: 'المبلغ المجمع لكل دور',
    totalCirculating: 'إجمالي السيولة المتداولة',
    
    // Steps
    step1Title: '١. إنشاء الجمعية',
    step1Desc: 'حدد المبلغ والتكرار وادعُ أصدقاءك بالرمز السري الخاص.',
    step2Title: '٢. دفع الاشتراكات',
    step2Desc: 'كل عضو يدفع عبر Wave أو Orange Money مع إيصال معتمد.',
    step3Title: '٣. تحديد الأدوار',
    step3Desc: 'قرعة عادلة أو ترتيب متفق عليه مسبقاً بكل شفافية.',
    step4Title: '٤. تحويل المبلغ',
    step4Desc: 'المستفيد من الدور يستلم كامل المبلغ مباشرة في محفظته.',
    
    // Trust
    trustedBy: 'يثق بنا أكثر من ١٥,٠٠٠ مدخر في السنغال',
    certifiedBceao: 'مطابق لمعايير البنك المركزي لدول غرب إفريقيا',
    chatWithSupport: 'تحتاج مساعدة؟ تواصل مع دعم دينك خالص على الرقم 704611894 221+',
    fastSupport: 'رد فوري خلال ٥ دقائق',
  },
  es: {
    // Spanish
    brandTagline: 'Ahorro Rotativo Certificado',
    dashboard: 'Panel de Control',
    myTontines: 'Mis Tontinas',
    myCotisations: 'Mis Cuotas',
    myWallet: 'Mi Billetera',
    allTontines: 'Todas las Tontinas',
    adminBackOffice: 'Panel de Administración',
    loginRegister: 'Iniciar Sesión / Registro',
    joinWithCode: 'Unirse (Código)',
    createTontine: 'Crear Tontina',
    logout: 'Cerrar Sesión',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    translate: 'Idioma',
    scrollTop: 'Ir arriba',
    whatsappSupport: 'Soporte WhatsApp',
    
    // Landing
    heroBadge: 'Plataforma Oficial Denc Xaalis Senegal',
    heroTitle1: 'El Ahorro Rotativo Moderno,',
    heroTitleHighlight: 'Transparente y Seguro',
    heroDesc: 'Gestiona tus círculos de ahorro rotativo (Tontina) con total confianza. Automatiza cuotas mediante Wave y Orange Money, y asegura cada turno de cobro en Senegal.',
    loginCta: 'Acceder a mi cuenta',
    registerCta: 'Crear cuenta gratuita',
    exploreSimulator: 'Probar Simulador',
    
    // Highlights
    waveOmTitle: 'Pagos con Wave y Orange Money',
    waveOmDesc: 'Paga tus cuotas en un clic mediante billeteras móviles de Senegal o tu saldo digital.',
    fairDrawTitle: 'Sorteo y Turnos Transparentes',
    fairDrawDesc: 'Sorteo automatizado sin sesgos con calendario previsto de pagos y notificaciones.',
    auditTitle: 'Seguridad y Panel de Control',
    auditDesc: 'Mediación de disputas, comprobantes certificados descargables y registro inmutable.',
    
    // WhatsApp
    whatsappReminder: 'Recordatorio WhatsApp',
    globalWhatsappReminder: 'Recordatorio Global WhatsApp',
    sendReminder: 'Enviar recordatorio',
    broadcastList: 'Lista de difusión automática',
    allUnpaidMembers: 'Miembros pendientes de pago',
    reminderMessagePrompt: 'Mensaje preparado para WhatsApp:',
    copyBroadcastText: 'Copiar mensaje grupal',
    quickPing: 'Enviar uno por uno',
    statusSent: 'Enviado',
    statusPending: 'Pendiente',
    
    // Simulator
    simTitle: 'Simulador de Ahorro Rotativo',
    simSub: 'Calcula al instante los montos y turnos para tu grupo de ahorro',
    membersCount: 'Número de miembros',
    contributionAmount: 'Cuota por miembro (FCFA)',
    cycleDuration: 'Duración total del ciclo',
    totalPotPerRound: 'Bolsa por turno',
    totalCirculating: 'Volumen total circulante',
    
    // Steps
    step1Title: '1. Crear Tontina',
    step1Desc: 'Establece el monto, la frecuencia e invita a tu círculo con un código secreto único.',
    step2Title: '2. Cuotas Seguras',
    step2Desc: 'Cada participante paga con Wave, OM o billetera con recibo certificado.',
    step3Title: '3. Asignación Imparcial',
    step3Desc: 'Sorteo transparente u orden consensuado según los acuerdos.',
    step4Title: '4. Pago Inmediato',
    step4Desc: 'El beneficiario del turno recibe la recaudación completa en su billetera.',
    
    // Trust
    trustedBy: 'Utilizado por más de 15.000 ahorradores en Senegal',
    certifiedBceao: 'Cumple con los estándares financieros BCEAO',
    chatWithSupport: '¿Necesitas ayuda? Chatea con soporte Denc Xaalis al +221 70 461 18 94',
    fastSupport: 'Respuesta en menos de 5 minutos',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  currentLanguage: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('denc_lang') as LanguageCode;
    if (saved && ['fr', 'wo', 'en', 'ar', 'es'].includes(saved)) return saved;
    return 'fr';
  });

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('denc_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = currentLanguage.dir || 'ltr';
  }, [language, currentLanguage]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to French
    if (translations.fr[key]) {
      return translations.fr[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
