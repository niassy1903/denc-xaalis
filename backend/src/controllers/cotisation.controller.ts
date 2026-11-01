import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.ts';
import { Cotisation } from '../models/Cotisation.model.ts';
import { Tontine } from '../models/Tontine.model.ts';
import { Tour } from '../models/Tour.model.ts';
import { Membre } from '../models/Membre.model.ts';
import { User } from '../models/User.model.ts';
import { Transaction } from '../models/Transaction.model.ts';
import { Notification } from '../models/Notification.model.ts';
import { logAudit } from '../middlewares/role.middleware.ts';

function generateTxRef(): string {
  return 'TX-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
}

export async function getMyCotisations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cotisations = await Cotisation.find({ membre: req.userId })
      .populate('tontine', 'nom montantCotisation frequence devise')
      .populate('tour', 'numeroTour datePrevue statut montantTotal')
      .sort({ dateEcheance: -1 });

    res.json({ success: true, cotisations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur cotisations', error: error.message });
  }
}

export async function getCotisationsByTontine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { tontineId } = req.params;
    const cotisations = await Cotisation.find({ tontine: tontineId })
      .populate('membre', 'nom prenom email telephone photoProfil')
      .populate('tour', 'numeroTour statut datePrevue')
      .sort({ createdAt: -1 });

    res.json({ success: true, cotisations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur cotisations tontine', error: error.message });
  }
}

export async function payCotisation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cotisationId } = req.params;
    const { moyenPaiement, referencePaiement, justificatif } = req.body;

    const cotisation = await Cotisation.findById(cotisationId);
    if (!cotisation) {
      res.status(404).json({ success: false, message: 'Cotisation introuvable' });
      return;
    }

    if (cotisation.membre.toString() !== req.userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Vous ne pouvez payer que votre propre cotisation' });
      return;
    }

    if (cotisation.statut === 'paye') {
      res.status(400).json({ success: false, message: 'Cette cotisation a déjà été réglée' });
      return;
    }

    const tontine = await Tontine.findById(cotisation.tontine);
    const tour = await Tour.findById(cotisation.tour);
    const user = await User.findById(req.userId);

    if (!tontine || !tour || !user) {
      res.status(404).json({ success: false, message: 'Données associées introuvables' });
      return;
    }

    const selectedMoyen = moyenPaiement || 'Wave';
    const ref = referencePaiement || generateTxRef();

    // Si paiement par portefeuille virtuel, vérifier le solde
    if (selectedMoyen === 'Portefeuille') {
      if ((user.soldePortefeuille || 0) < cotisation.montant) {
        res.status(400).json({
          success: false,
          message: `Solde insuffisant dans votre portefeuille (${(user.soldePortefeuille || 0).toLocaleString('fr-FR')} XOF). Veuillez recharger ou choisir Wave/Orange Money.`,
        });
        return;
      }
      user.soldePortefeuille -= cotisation.montant;
      await user.save();
    }

    // Mettre à jour la cotisation
    cotisation.statut = 'paye';
    cotisation.datePaiement = new Date();
    cotisation.moyenPaiement = selectedMoyen;
    cotisation.referencePaiement = ref;
    cotisation.justificatif = justificatif || `Paiement validé via ${selectedMoyen}`;
    cotisation.valideParPresident = true;
    await cotisation.save();

    // Mettre à jour le cumul du membre
    await Membre.findOneAndUpdate(
      { tontine: tontine._id, user: req.userId },
      { $inc: { totalCotise: cotisation.montant } }
    );

    // Mettre à jour les stats du tour & tontine
    tour.cotisationsRecues += cotisation.montant;
    await tour.save();

    tontine.fondsTotalCollecte += cotisation.montant;
    await tontine.save();

    // Enregistrer la transaction
    const transaction = await Transaction.create({
      type: 'cotisation',
      montant: cotisation.montant,
      reference: ref,
      tontine: tontine._id,
      user: req.userId,
      statut: 'succes',
      moyenPaiement: selectedMoyen,
      description: `Cotisation Tour #${tour.numeroTour} - ${tontine.nom}`,
    });

    // Notifier le président
    if (tontine.president.toString() !== req.userId) {
      await Notification.create({
        destinataire: tontine.president,
        type: 'echeance',
        titre: 'Cotisation reçue',
        message: `${user.prenom} ${user.nom} a réglé sa cotisation de ${cotisation.montant.toLocaleString('fr-FR')} XOF pour le Tour #${tour.numeroTour}.`,
        lien: `/tontines/${tontine._id}`,
      });
    }

    await logAudit(req.userId, 'PAIEMENT_COTISATION', req.ip || '127.0.0.1', `Paiement ${cotisation.montant} XOF via ${selectedMoyen} (Réf: ${ref})`);

    res.json({
      success: true,
      message: `Paiement de ${cotisation.montant.toLocaleString('fr-FR')} XOF validé avec succès via ${selectedMoyen} !`,
      cotisation,
      transaction,
      soldePortefeuille: user.soldePortefeuille,
    });
  } catch (error: any) {
    console.error('Pay cotisation error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du règlement de la cotisation', error: error.message });
  }
}

export async function validateCotisation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cotisationId } = req.params;
    const cotisation = await Cotisation.findById(cotisationId).populate('tontine');

    if (!cotisation) {
      res.status(404).json({ success: false, message: 'Cotisation introuvable' });
      return;
    }

    const tontine = cotisation.tontine as any;
    if (tontine.president.toString() !== req.userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Seul le président peut valider manuellement les cotisations' });
      return;
    }

    cotisation.statut = 'paye';
    cotisation.valideParPresident = true;
    cotisation.datePaiement = new Date();
    await cotisation.save();

    res.json({ success: true, message: 'Cotisation marquée comme payée et validée', cotisation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur validation cotisation', error: error.message });
  }
}
