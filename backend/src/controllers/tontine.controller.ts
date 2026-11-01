import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.ts';
import { User } from '../models/User.model.ts';
import { Tontine } from '../models/Tontine.model.ts';
import { Membre } from '../models/Membre.model.ts';
import { Tour } from '../models/Tour.model.ts';
import { Cotisation } from '../models/Cotisation.model.ts';
import { Notification } from '../models/Notification.model.ts';
import { logAudit } from '../middlewares/role.middleware.ts';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'DX-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createTontine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nom, description, montantCotisation, frequence, nombreMembresMax, regles, dateDebut } = req.body;

    if (!nom || !montantCotisation || !nombreMembresMax) {
      res.status(400).json({ success: false, message: 'Nom, montant et nombre de membres sont obligatoires' });
      return;
    }

    let codeInvitation = generateCode();
    let codeExists = await Tontine.findOne({ codeInvitation });
    while (codeExists) {
      codeInvitation = generateCode();
      codeExists = await Tontine.findOne({ codeInvitation });
    }

    const tontine = await Tontine.create({
      nom,
      description: description || '',
      montantCotisation: Number(montantCotisation),
      frequence: frequence || 'mensuelle',
      devise: 'XOF',
      nombreMembresMax: Number(nombreMembresMax),
      regles: regles || '',
      dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
      president: req.userId,
      statut: 'en_attente',
      codeInvitation,
      tourActuelNumero: 1,
      fondsTotalCollecte: 0,
    });

    // Inscrire automatiquement le créateur comme président & membre #1
    await Membre.create({
      tontine: tontine._id,
      user: req.userId,
      role: 'president',
      positionTirage: 1,
      statut: 'actif',
      totalCotise: 0,
      totalRecu: 0,
    });

    // Mettre à jour le rôle de l'utilisateur en tant que president_tontine s'il était simple membre
    const currentUser = await User.findById(req.userId);
    if (currentUser && currentUser.role === 'membre') {
      currentUser.role = 'president_tontine';
      await currentUser.save();
    }

    await logAudit(req.userId, 'CREATION_TONTINE', req.ip || '127.0.0.1', `Tontine créée: ${tontine.nom} (${tontine.codeInvitation})`);

    res.status(201).json({
      success: true,
      message: 'Tontine créée avec succès ! Vous êtes désigné Président de la tontine.',
      tontine,
      userRole: currentUser?.role || 'president_tontine',
    });
  } catch (error: any) {
    console.error('Create tontine error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la tontine', error: error.message });
  }
}

export async function getMyTontines(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Retrouver les tontines où l'utilisateur est membre
    const adhésions = await Membre.find({ user: req.userId });
    const tontineIds = adhésions.map((m) => m.tontine);

    const tontines = await Tontine.find({ _id: { $in: tontineIds } })
      .populate('president', 'nom prenom email telephone')
      .sort({ createdAt: -1 });

    // Enrichir avec le nombre de membres
    const tontinesWithStats = await Promise.all(
      tontines.map(async (t) => {
        const count = await Membre.countDocuments({ tontine: t._id });
        const obj = t.toObject();
        return { ...obj, membresCount: count };
      })
    );

    res.json({ success: true, tontines: tontinesWithStats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur récupération tontines', error: error.message });
  }
}

export async function getAllPublicTontines(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tontines = await Tontine.find({ statut: { $in: ['en_attente', 'en_cours'] } })
      .populate('president', 'nom prenom email telephone photoProfil')
      .sort({ createdAt: -1 })
      .limit(30);

    const tontinesWithCount = await Promise.all(
      tontines.map(async (t) => {
        const count = await Membre.countDocuments({ tontine: t._id });
        const obj = t.toObject();
        return { ...obj, membresCount: count };
      })
    );

    res.json({ success: true, tontines: tontinesWithCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur catalogue tontines', error: error.message });
  }
}

export async function getTontineById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const tontine = await Tontine.findById(id).populate('president', 'nom prenom email telephone photoProfil');
    
    if (!tontine) {
      res.status(404).json({ success: false, message: 'Tontine introuvable' });
      return;
    }

    const membres = await Membre.find({ tontine: id })
      .populate('user', 'nom prenom email telephone photoProfil soldePortefeuille')
      .sort({ positionTirage: 1 });

    const tours = await Tour.find({ tontine: id })
      .populate('beneficiaire', 'nom prenom email telephone photoProfil')
      .sort({ numeroTour: 1 });

    const cotisations = await Cotisation.find({ tontine: id })
      .populate('membre', 'nom prenom email telephone')
      .sort({ createdAt: -1 });

    // Calculer les stats de la tontine
    const totalAttendus = tontine.montantCotisation * (membres.length || 1);

    res.json({
      success: true,
      tontine: {
        ...tontine.toObject(),
        membresCount: membres.length,
        montantCagnotteTour: totalAttendus,
      },
      membres,
      tours,
      cotisations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur détail tontine', error: error.message });
  }
}

export async function joinTontineByCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { codeInvitation } = req.body;

    if (!codeInvitation) {
      res.status(400).json({ success: false, message: 'Le code d\'invitation est obligatoire' });
      return;
    }

    const tontine = await Tontine.findOne({ codeInvitation: codeInvitation.toUpperCase().trim() });
    if (!tontine) {
      res.status(404).json({ success: false, message: 'Aucune tontine trouvée avec ce code d\'invitation' });
      return;
    }

    // Vérifier si déjà membre
    const existingMember = await Membre.findOne({ tontine: tontine._id, user: req.userId });
    if (existingMember) {
      res.status(400).json({ success: false, message: 'Vous êtes déjà membre de cette tontine' });
      return;
    }

    // Vérifier la capacité
    const currentMembersCount = await Membre.countDocuments({ tontine: tontine._id });
    if (currentMembersCount >= tontine.nombreMembresMax) {
      res.status(400).json({ success: false, message: 'Cette tontine a déjà atteint le nombre maximal de membres' });
      return;
    }

    if (tontine.statut === 'terminee' || tontine.statut === 'annulee') {
      res.status(400).json({ success: false, message: 'Cette tontine est clôturée' });
      return;
    }

    const newPosition = currentMembersCount + 1;

    const nouveauMembre = await Membre.create({
      tontine: tontine._id,
      user: req.userId,
      role: 'membre',
      positionTirage: newPosition,
      statut: 'actif',
      totalCotise: 0,
      totalRecu: 0,
    });

    // Notifier le président
    await Notification.create({
      destinataire: tontine.president,
      type: 'invitation',
      titre: 'Nouveau membre rejoint !',
      message: `${req.user?.prenom} ${req.user?.nom} a rejoint votre tontine "${tontine.nom}".`,
      lien: `/tontines/${tontine._id}`,
    });

    await logAudit(req.userId, 'REJOINDRE_TONTINE', req.ip || '127.0.0.1', `Rejoint tontine ${tontine.nom}`);

    res.json({
      success: true,
      message: `Félicitations ! Vous avez rejoint la tontine "${tontine.nom}".`,
      tontineId: tontine._id,
      membre: nouveauMembre,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'adhésion', error: error.message });
  }
}

export async function startTontine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const tontine = await Tontine.findById(id);

    if (!tontine) {
      res.status(404).json({ success: false, message: 'Tontine introuvable' });
      return;
    }

    // Vérifier les droits (président ou admin)
    if (tontine.president.toString() !== req.userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Seul le président de la tontine peut lancer les tours' });
      return;
    }

    const membres = await Membre.find({ tontine: id }).sort({ positionTirage: 1 });
    if (membres.length < 2) {
      res.status(400).json({ success: false, message: 'Une tontine nécessite au moins 2 membres pour être lancée' });
      return;
    }

    // Supprimer les éventuels anciens tours
    await Tour.deleteMany({ tontine: id });
    await Cotisation.deleteMany({ tontine: id });

    // Générer les tours pour chaque membre selon son ordre
    const montantTotalTour = tontine.montantCotisation * membres.length;
    const dateDebut = new Date();
    const toursToCreate = [];

    for (let i = 0; i < membres.length; i++) {
      const tourDate = new Date(dateDebut);
      if (tontine.frequence === 'hebdomadaire') {
        tourDate.setDate(tourDate.getDate() + i * 7);
      } else if (tontine.frequence === 'bimensuelle') {
        tourDate.setDate(tourDate.getDate() + i * 15);
      } else {
        // mensuelle
        tourDate.setMonth(tourDate.getMonth() + i);
      }

      toursToCreate.push({
        tontine: tontine._id,
        numeroTour: i + 1,
        beneficiaire: membres[i].user,
        datePrevue: tourDate,
        montantTotal: montantTotalTour,
        cotisationsRecues: 0,
        statut: i === 0 ? 'en_cours' : 'a_venir',
      });
    }

    const createdTours = await Tour.insertMany(toursToCreate);

    // Initialiser les cotisations pour le Tour 1
    const tour1 = createdTours[0];
    const cotisationsToCreate = membres.map((m) => ({
      tontine: tontine._id,
      membre: m.user,
      tour: tour1._id,
      montant: tontine.montantCotisation,
      dateEcheance: tour1.datePrevue,
      statut: 'impaye',
      valideParPresident: false,
    }));

    await Cotisation.insertMany(cotisationsToCreate);

    tontine.statut = 'en_cours';
    tontine.tourActuelNumero = 1;
    await tontine.save();

    // Notifier tous les membres
    for (const membre of membres) {
      await Notification.create({
        destinataire: membre.user,
        type: 'echeance',
        titre: `La tontine "${tontine.nom}" a démarré !`,
        message: `Le Tour 1 est maintenant ouvert. Cotisation attendue : ${tontine.montantCotisation.toLocaleString('fr-FR')} XOF.`,
        lien: `/tontines/${tontine._id}`,
      });
    }

    await logAudit(req.userId, 'DEMARRAGE_TONTINE', req.ip || '127.0.0.1', `Tontine ${tontine.nom} lancée avec ${membres.length} tours`);

    res.json({
      success: true,
      message: `Tontine lancée avec succès ! ${toursToCreate.length} tours de collecte ont été programmés.`,
      tontine,
      tours: createdTours,
    });
  } catch (error: any) {
    console.error('Start tontine error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du lancement de la tontine', error: error.message });
  }
}

export async function randomizeDrawOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const tontine = await Tontine.findById(id);

    if (!tontine) {
      res.status(404).json({ success: false, message: 'Tontine introuvable' });
      return;
    }

    if (tontine.president.toString() !== req.userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Seul le président peut modifier l\'ordre de tirage' });
      return;
    }

    if (tontine.statut === 'en_cours' || tontine.statut === 'terminee') {
      res.status(400).json({ success: false, message: 'Impossible de modifier l\'ordre lorsque la tontine est déjà en cours' });
      return;
    }

    const membres = await Membre.find({ tontine: id });
    
    // Mélange de Fisher-Yates
    const shuffled = [...membres].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      shuffled[i].positionTirage = i + 1;
      await shuffled[i].save();
    }

    await logAudit(req.userId, 'TIRAGE_AU_SORT', req.ip || '127.0.0.1', `Tirage au sort effectué pour ${tontine.nom}`);

    res.json({
      success: true,
      message: 'Tirage au sort effectué avec succès ! L\'ordre de passage a été redistribué équitablement.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors du tirage au sort', error: error.message });
  }
}

export async function updateMembreRoleInTontine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id, membreId } = req.params;
    const { role } = req.body;

    if (!['president', 'secretaire', 'tresorier', 'membre'].includes(role)) {
      res.status(400).json({ success: false, message: 'Rôle invalide. Valeurs possibles: president, secretaire, tresorier, membre' });
      return;
    }

    const tontine = await Tontine.findById(id);
    if (!tontine) {
      res.status(404).json({ success: false, message: 'Tontine introuvable' });
      return;
    }

    // Seul le président actuel de la tontine ou un admin global peut attribuer des rôles
    const isPresident = tontine.president.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';

    if (!isPresident && !isAdmin) {
      res.status(403).json({ success: false, message: 'Seul le président de la tontine ou un administrateur peut modifier les rôles' });
      return;
    }

    const membre = await Membre.findById(membreId).populate('user', 'nom prenom email telephone');
    if (!membre || membre.tontine.toString() !== id) {
      res.status(404).json({ success: false, message: 'Membre introuvable dans cette tontine' });
      return;
    }

    const ancientRole = membre.role;
    membre.role = role;
    await membre.save();

    // Si le rôle devient président, mettre à jour la tontine et l'utilisateur
    if (role === 'president') {
      tontine.president = membre.user._id;
      await tontine.save();
      await User.findByIdAndUpdate(membre.user._id, { role: 'president_tontine' });
    }

    const roleLabels: Record<string, string> = {
      president: 'Président(e)',
      secretaire: 'Secrétaire',
      tresorier: 'Trésorier(ère)',
      membre: 'Membre standard',
    };

    await Notification.create({
      destinataire: membre.user._id,
      type: 'invitation',
      titre: 'Attribution de rôle dans la tontine',
      message: `Votre rôle dans la tontine "${tontine.nom}" a été mis à jour en tant que : ${roleLabels[role] || role}.`,
      lien: `/tontines/${tontine._id}`,
    });

    await logAudit(
      req.userId,
      'MODIF_ROLE_MEMBRE_TONTINE',
      req.ip || '127.0.0.1',
      `Rôle du membre ${membre.user.email} changé de ${ancientRole} à ${role} dans la tontine ${tontine.nom}`
    );

    res.json({
      success: true,
      message: `Le rôle de ${membre.user.prenom} ${membre.user.nom} a été attribué avec succès : ${roleLabels[role] || role}.`,
      membre,
    });
  } catch (error: any) {
    console.error('Update membre role error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'attribution du rôle', error: error.message });
  }
}
