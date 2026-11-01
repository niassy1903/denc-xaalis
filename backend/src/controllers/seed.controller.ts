import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.ts';
import { Tontine } from '../models/Tontine.model.ts';
import { Membre } from '../models/Membre.model.ts';
import { Tour } from '../models/Tour.model.ts';
import { Cotisation } from '../models/Cotisation.model.ts';
import { Transaction } from '../models/Transaction.model.ts';
import { Litige } from '../models/Litige.model.ts';
import { Notification } from '../models/Notification.model.ts';
import { AuditLog } from '../models/AuditLog.model.ts';

export async function ensureSeeded() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seed] ⚡ Base de données vide. Exécution automatique du seeder...');
      await seedDatabase();
    } else {
      console.log(`[Seed] ℹ️ Base de données opérationnelle avec ${userCount} utilisateurs.`);
    }
  } catch (error) {
    console.error('[Seed] Erreur lors de la vérification de la base:', error);
  }
}

export async function seedDatabase(req?: Request, res?: Response) {
  try {
    console.log('[Seed] Début de l\'initialisation des données réelles Denc Xaalis...');

    // Nettoyage complet
    await User.deleteMany({});
    await Tontine.deleteMany({});
    await Membre.deleteMany({});
    await Tour.deleteMany({});
    await Cotisation.deleteMany({});
    await Transaction.deleteMany({});
    await Litige.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    const passwordHash = await bcrypt.hash('passer123', 10);

    // 1. Création des Utilisateurs
    const admin = await User.create({
      nom: 'Niassy',
      prenom: 'Lamine',
      email: 'admin@dencxaalis.sn',
      telephone: '+221 77 000 00 01',
      motDePasseHash: passwordHash,
      role: 'admin',
      statut: 'actif',
      soldePortefeuille: 250000,
      photoProfil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const presidentAwa = await User.create({
      nom: 'Diallo',
      prenom: 'Awa',
      email: 'awa.diallo@dencxaalis.sn',
      telephone: '+221 77 123 45 67',
      motDePasseHash: passwordHash,
      role: 'president_tontine',
      statut: 'actif',
      soldePortefeuille: 150000,
      photoProfil: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const presidentMoussa = await User.create({
      nom: 'Ndiaye',
      prenom: 'Moussa',
      email: 'moussa.ndiaye@dencxaalis.sn',
      telephone: '+221 78 456 78 90',
      motDePasseHash: passwordHash,
      role: 'president_tontine',
      statut: 'actif',
      soldePortefeuille: 120000,
      photoProfil: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const membreFatou = await User.create({
      nom: 'Sow',
      prenom: 'Fatou',
      email: 'fatou.sow@dencxaalis.sn',
      telephone: '+221 76 890 12 34',
      motDePasseHash: passwordHash,
      role: 'membre',
      statut: 'actif',
      soldePortefeuille: 80000,
      photoProfil: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    });

    const membreIbrahima = await User.create({
      nom: 'Ba',
      prenom: 'Ibrahima',
      email: 'ibrahima.ba@dencxaalis.sn',
      telephone: '+221 77 555 44 33',
      motDePasseHash: passwordHash,
      role: 'membre',
      statut: 'actif',
      soldePortefeuille: 95000,
      photoProfil: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const membreKhadija = await User.create({
      nom: 'Fall',
      prenom: 'Khadija',
      email: 'khadija.fall@dencxaalis.sn',
      telephone: '+221 78 222 11 00',
      motDePasseHash: passwordHash,
      role: 'membre',
      statut: 'actif',
      soldePortefeuille: 60000,
      photoProfil: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    });

    // 2. Création de la Tontine 1 (En cours) : "Tontine Entrepreneures Dakar"
    const tontine1 = await Tontine.create({
      nom: 'Tontine Entrepreneures Dakar',
      description: 'Épargne solidaire mensuelle pour financer le fonds de roulement de nos commerces.',
      montantCotisation: 50000,
      frequence: 'mensuelle',
      devise: 'XOF',
      dateDebut: new Date('2026-01-10'),
      statut: 'en_cours',
      president: presidentAwa._id,
      nombreMembresMax: 4,
      regles: 'Cotisation obligatoire avant le 10 de chaque mois. En cas de retard supérieur à 3 jours, pénalité de 2 500 FCFA.',
      codeInvitation: 'DX-DKR26',
      fondsTotalCollecte: 350000,
      tourActuelNumero: 2,
    });

    // Membres Tontine 1
    const m1 = await Membre.create({
      tontine: tontine1._id,
      user: presidentAwa._id,
      role: 'president',
      positionTirage: 1,
      statut: 'actif',
      totalCotise: 100000,
      totalRecu: 200000,
    });

    const m2 = await Membre.create({
      tontine: tontine1._id,
      user: membreFatou._id,
      role: 'membre',
      positionTirage: 2,
      statut: 'actif',
      totalCotise: 100000,
      totalRecu: 0,
    });

    const m3 = await Membre.create({
      tontine: tontine1._id,
      user: membreIbrahima._id,
      role: 'membre',
      positionTirage: 3,
      statut: 'actif',
      totalCotise: 100000,
      totalRecu: 0,
    });

    const m4 = await Membre.create({
      tontine: tontine1._id,
      user: membreKhadija._id,
      role: 'membre',
      positionTirage: 4,
      statut: 'actif',
      totalCotise: 50000,
      totalRecu: 0,
    });

    // Tours Tontine 1 (4 tours de 200 000 FCFA chacun)
    const tour1 = await Tour.create({
      tontine: tontine1._id,
      numeroTour: 1,
      beneficiaire: presidentAwa._id,
      datePrevue: new Date('2026-01-10'),
      dateEffective: new Date('2026-01-11'),
      montantTotal: 200000,
      cotisationsRecues: 200000,
      statut: 'attribue',
    });

    const tour2 = await Tour.create({
      tontine: tontine1._id,
      numeroTour: 2,
      beneficiaire: membreFatou._id,
      datePrevue: new Date('2026-02-10'),
      montantTotal: 200000,
      cotisationsRecues: 150000,
      statut: 'en_cours',
    });

    const tour3 = await Tour.create({
      tontine: tontine1._id,
      numeroTour: 3,
      beneficiaire: membreIbrahima._id,
      datePrevue: new Date('2026-03-10'),
      montantTotal: 200000,
      cotisationsRecues: 0,
      statut: 'a_venir',
    });

    const tour4 = await Tour.create({
      tontine: tontine1._id,
      numeroTour: 4,
      beneficiaire: membreKhadija._id,
      datePrevue: new Date('2026-04-10'),
      montantTotal: 200000,
      cotisationsRecues: 0,
      statut: 'a_venir',
    });

    // Cotisations Tour 2
    await Cotisation.create({
      tontine: tontine1._id,
      membre: presidentAwa._id,
      tour: tour2._id,
      montant: 50000,
      datePaiement: new Date('2026-02-05'),
      dateEcheance: tour2.datePrevue,
      moyenPaiement: 'Wave',
      statut: 'paye',
      referencePaiement: 'TX-WV-99120',
      valideParPresident: true,
    });

    await Cotisation.create({
      tontine: tontine1._id,
      membre: membreFatou._id,
      tour: tour2._id,
      montant: 50000,
      datePaiement: new Date('2026-02-07'),
      dateEcheance: tour2.datePrevue,
      moyenPaiement: 'Orange Money',
      statut: 'paye',
      referencePaiement: 'TX-OM-44129',
      valideParPresident: true,
    });

    await Cotisation.create({
      tontine: tontine1._id,
      membre: membreIbrahima._id,
      tour: tour2._id,
      montant: 50000,
      datePaiement: new Date('2026-02-08'),
      dateEcheance: tour2.datePrevue,
      moyenPaiement: 'Wave',
      statut: 'paye',
      referencePaiement: 'TX-WV-77301',
      valideParPresident: true,
    });

    await Cotisation.create({
      tontine: tontine1._id,
      membre: membreKhadija._id,
      tour: tour2._id,
      montant: 50000,
      dateEcheance: tour2.datePrevue,
      moyenPaiement: 'Wave',
      statut: 'impaye',
      valideParPresident: false,
    });

    // 3. Création de la Tontine 2 (En attente d'adhésion) : "Tontine Tabaski 2026"
    const tontine2 = await Tontine.create({
      nom: 'Tontine Tabaski Solidarité 2026',
      description: 'Épargne hebdomadaire pour l\'achat des moutons de Tabaski et provisions familiales.',
      montantCotisation: 25000,
      frequence: 'hebdomadaire',
      devise: 'XOF',
      dateDebut: new Date('2026-03-01'),
      statut: 'en_attente',
      president: presidentMoussa._id,
      nombreMembresMax: 6,
      regles: 'Tirage au sort automatique à l\'ouverture. Cotisation chaque dimanche.',
      codeInvitation: 'DX-TAB26',
      fondsTotalCollecte: 0,
      tourActuelNumero: 1,
    });

    await Membre.create({
      tontine: tontine2._id,
      user: presidentMoussa._id,
      role: 'president',
      positionTirage: 1,
      statut: 'actif',
      totalCotise: 0,
      totalRecu: 0,
    });

    await Membre.create({
      tontine: tontine2._id,
      user: membreFatou._id,
      role: 'membre',
      positionTirage: 2,
      statut: 'actif',
      totalCotise: 0,
      totalRecu: 0,
    });

    await Membre.create({
      tontine: tontine2._id,
      user: membreIbrahima._id,
      role: 'membre',
      positionTirage: 3,
      statut: 'actif',
      totalCotise: 0,
      totalRecu: 0,
    });

    // 4. Transactions d'exemple
    await Transaction.create({
      type: 'versement_beneficiaire',
      montant: 200000,
      reference: 'POT-DKR-001',
      tontine: tontine1._id,
      user: presidentAwa._id,
      statut: 'succes',
      moyenPaiement: 'Portefeuille Denc Xaalis',
      description: 'Versement cagnotte Tour #1 (Tontine Entrepreneures Dakar)',
      createdAt: new Date('2026-01-11'),
    });

    await Transaction.create({
      type: 'cotisation',
      montant: 50000,
      reference: 'TX-WV-99120',
      tontine: tontine1._id,
      user: presidentAwa._id,
      statut: 'succes',
      moyenPaiement: 'Wave',
      description: 'Cotisation Tour #2 - Tontine Entrepreneures Dakar',
      createdAt: new Date('2026-02-05'),
    });

    // 5. Litige d'exemple
    await Litige.create({
      tontine: tontine1._id,
      declarePar: presidentAwa._id,
      membreConcerne: membreKhadija._id,
      titre: 'Retard de cotisation Tour #2',
      description: 'Le délai de paiement du 10 février a été dépassé sans justificatif préalable. Une relance a été transmise.',
      statut: 'ouvert',
      dateDeclaration: new Date('2026-02-12'),
    });

    // 6. Notifications
    await Notification.create({
      destinataire: membreFatou._id,
      type: 'echeance',
      titre: 'Votre tour de cagnotte arrive !',
      message: 'Vous êtes la bénéficiaire désignée du Tour #2 de la Tontine Entrepreneures Dakar. Cagnotte : 200 000 XOF.',
      lien: `/tontines/${tontine1._id}`,
    });

    await Notification.create({
      destinataire: membreKhadija._id,
      type: 'retard',
      titre: 'Échéance dépassée - Tour #2',
      message: 'Veuillez régulariser votre cotisation de 50 000 XOF pour débloquer le versement à Fatou Sow.',
      lien: `/tontines/${tontine1._id}`,
    });

    // 7. Audit log initial
    await AuditLog.create({
      utilisateur: admin._id,
      action: 'INITIALISATION_PLATEFORME',
      ip: '127.0.0.1',
      details: 'Base de données Denc Xaalis initialisée avec les comptes de démonstration et tontines modèles.',
    });

    console.log('[Seed] ✅ Données de démonstration initialisées avec succès dans MongoDB !');

    if (res) {
      res.json({
        success: true,
        message: 'Base de données initialisée avec succès avec les comptes et tontines réelles de démonstration !',
        comptesDisponibles: [
          { role: 'Admin', email: 'admin@dencxaalis.sn', pass: 'passer123' },
          { role: 'Présidente (Awa)', email: 'awa.diallo@dencxaalis.sn', pass: 'passer123' },
          { role: 'Membre (Fatou)', email: 'fatou.sow@dencxaalis.sn', pass: 'passer123' },
        ],
      });
    }
  } catch (error: any) {
    console.error('[Seed] ❌ Erreur seed:', error);
    if (res) {
      res.status(500).json({ success: false, message: 'Erreur lors du seed', error: error.message });
    }
  }
}
