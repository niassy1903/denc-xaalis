export type UserRole = 'admin' | 'president_tontine' | 'membre';
export type UserStatus = 'actif' | 'suspendu' | 'en_attente';

export interface IUser {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  statut: UserStatus;
  dateInscription: string;
  photoProfil?: string;
  soldePortefeuille?: number;
  emailVerifie?: boolean;
}

export type FrequenceTontine = 'hebdomadaire' | 'mensuelle' | 'bimensuelle';
export type StatutTontine = 'en_attente' | 'en_cours' | 'terminee' | 'annulee';

export interface ITontine {
  _id: string;
  nom: string;
  description: string;
  montantCotisation: number;
  frequence: FrequenceTontine;
  devise: string;
  dateDebut: string;
  statut: StatutTontine;
  president: IUser | string;
  nombreMembresMax: number;
  regles?: string;
  codeInvitation: string;
  fondsTotalCollecte: number;
  tourActuelNumero?: number;
  createdAt: string;
  membresCount?: number;
  prochaineEcheance?: string;
}

export type RoleMembre = 'president' | 'secretaire' | 'tresorier' | 'membre';
export type StatutMembre = 'actif' | 'en_retard' | 'exclu' | 'en_attente';

export interface IMembre {
  _id: string;
  tontine: ITontine | string;
  user: IUser;
  role: RoleMembre;
  positionTirage: number;
  dateAdhesion: string;
  statut: StatutMembre;
  totalCotise: number;
  totalRecu: number;
}

export type StatutTour = 'a_venir' | 'en_cours' | 'attribue' | 'reporte';

export interface ITour {
  _id: string;
  tontine: string;
  numeroTour: number;
  beneficiaire: IUser;
  datePrevue: string;
  dateEffective?: string;
  montantTotal: number;
  cotisationsRecues: number;
  statut: StatutTour;
  cotisationsCount?: number;
}

export type StatutCotisation = 'paye' | 'en_retard' | 'impaye' | 'en_validation';
export type MoyenPaiement = 'Wave' | 'Orange Money' | 'Free Money' | 'Virement' | 'Espèces' | 'Portefeuille';

export interface ICotisation {
  _id: string;
  tontine: ITontine | string;
  membre: IMembre | IUser | string;
  tour: ITour | string;
  montant: number;
  datePaiement?: string;
  dateEcheance: string;
  moyenPaiement?: MoyenPaiement;
  statut: StatutCotisation;
  justificatif?: string;
  referencePaiement?: string;
  valideParPresident?: boolean;
}

export type TypeTransaction = 'cotisation' | 'versement_beneficiaire' | 'penalite' | 'depot_portefeuille' | 'retrait';
export type StatutTransaction = 'succes' | 'en_cours' | 'echec';

export interface ITransaction {
  _id: string;
  type: TypeTransaction;
  montant: number;
  reference: string;
  tontine?: ITontine | string;
  user: IUser | string;
  statut: StatutTransaction;
  moyenPaiement: string;
  description?: string;
  createdAt: string;
}

export type StatutLitige = 'ouvert' | 'en_mediation' | 'resolu' | 'rejete';

export interface ILitige {
  _id: string;
  tontine: ITontine | string;
  declarePar: IUser;
  membreConcerne?: IUser;
  titre: string;
  description: string;
  statut: StatutLitige;
  resolution?: string;
  dateDeclaration: string;
  dateResolution?: string;
}

export interface INotification {
  _id: string;
  destinataire: string;
  type: 'echeance' | 'tour_recu' | 'retard' | 'invitation' | 'litige' | 'systeme';
  titre: string;
  message: string;
  lu: boolean;
  lien?: string;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  utilisateur?: IUser | string;
  action: string;
  ip: string;
  details?: string;
  createdAt: string;
}

export interface IAdminStats {
  totalUsers: number;
  totalTontines: number;
  tontinesActives: number;
  volumeTotalCotise: number;
  volumeVerseBeneficiaires: number;
  tauxRecouvrement: number;
  litigesEnCours: number;
  recentTransactionsCount: number;
}
