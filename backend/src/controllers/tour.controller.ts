import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.ts';
import { Tour } from '../models/Tour.model.ts';
import { Tontine } from '../models/Tontine.model.ts';
import { Membre } from '../models/Membre.model.ts';
import { User } from '../models/User.model.ts';
import { Cotisation } from '../models/Cotisation.model.ts';
import { Transaction } from '../models/Transaction.model.ts';
import { Notification } from '../models/Notification.model.ts';
import { logAudit } from '../middlewares/role.middleware.ts';

function generateTxRef(): string {
  return 'POT-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
}

export async function getToursByTontine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { tontineId } = req.params;
    const tours = await Tour.find({ tontine: tontineId })
      .populate('beneficiaire', 'nom prenom email telephone photoProfil')
      .sort({ numeroTour: 1 });

    res.json({ success: true, tours });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur tours', error: error.message });
  }
}

export async function payoutTour(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { tourId } = req.params;
    const tour = await Tour.findById(tourId).populate('beneficiaire');

    if (!tour) {
      res.status(404).json({ success: false, message: 'Tour introuvable' });
      return;
    }

    if (tour.statut === 'attribue') {
      res.status(400).json({ success: false, message: 'La cagnotte de ce tour a déjà été versée au bénéficiaire' });
      return;
    }

    const tontine = await Tontine.findById(tour.tontine);
    if (!tontine) {
      res.status(404).json({ success: false, message: 'Tontine introuvable' });
      return;
    }

    // Vérifier les droits du président ou admin
    if (tontine.president.toString() !== req.userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Seul le président de la tontine peut ordonner le versement de la cagnotte' });
      return;
    }

    const beneficiaire = tour.beneficiaire as any;
    const montantPot = tour.montantTotal;
    const ref = generateTxRef();

    // Mettre à jour le statut du tour
    tour.statut = 'attribue';
    tour.dateEffective = new Date();
    await tour.save();

    // Mettre à jour le solde et le total reçu du bénéficiaire
    await User.findByIdAndUpdate(beneficiaire._id, {
      $inc: { soldePortefeuille: montantPot },
    });

    await Membre.findOneAndUpdate(
      { tontine: tontine._id, user: beneficiaire._id },
      { $inc: { totalRecu: montantPot } }
    );

    // Enregistrer la transaction de versement
    const transaction = await Transaction.create({
      type: 'versement_beneficiaire',
      montant: montantPot,
      reference: ref,
      tontine: tontine._id,
      user: beneficiaire._id,
      statut: 'succes',
      moyenPaiement: 'Portefeuille Denc Xaalis',
      description: `Versement cagnotte Tour #${tour.numeroTour} (${tontine.nom})`,
    });

    // Passer au tour suivant ou clôturer la tontine
    const prochainNumero = tour.numeroTour + 1;
    const prochainTour = await Tour.findOne({ tontine: tontine._id, numeroTour: prochainNumero });

    if (prochainTour) {
      prochainTour.statut = 'en_cours';
      await prochainTour.save();

      tontine.tourActuelNumero = prochainNumero;
      await tontine.save();

      // Générer les cotisations pour le prochain tour
      const membres = await Membre.find({ tontine: tontine._id });
      const cotisationsProchainTour = membres.map((m) => ({
        tontine: tontine._id,
        membre: m.user,
        tour: prochainTour._id,
        montant: tontine.montantCotisation,
        dateEcheance: prochainTour.datePrevue,
        statut: 'impaye',
        valideParPresident: false,
      }));

      await Cotisation.insertMany(cotisationsProchainTour);

      // Notifier le groupe de l'ouverture du tour suivant
      for (const m of membres) {
        await Notification.create({
          destinataire: m.user,
          type: 'tour_recu',
          titre: `Cagnotte Tour #${tour.numeroTour} versée & Tour #${prochainNumero} ouvert !`,
          message: `${beneficiaire.prenom} ${beneficiaire.nom} a bien reçu sa cagnotte de ${montantPot.toLocaleString('fr-FR')} XOF. Le Tour #${prochainNumero} est maintenant ouvert.`,
          lien: `/tontines/${tontine._id}`,
        });
      }
    } else {
      // Fin du cycle complet de la tontine !
      tontine.statut = 'terminee';
      await tontine.save();

      const membres = await Membre.find({ tontine: tontine._id });
      for (const m of membres) {
        await Notification.create({
          destinataire: m.user,
          type: 'systeme',
          titre: `🎉 Tontine "${tontine.nom}" terminée avec succès !`,
          message: `Tous les membres ont reçu leur tour de collecte. Félicitations pour cette belle épargne solidaire !`,
          lien: `/tontines/${tontine._id}`,
        });
      }
    }

    await logAudit(req.userId, 'VERSEMENT_CAGNOTTE', req.ip || '127.0.0.1', `Versement de ${montantPot} XOF à ${beneficiaire.prenom} ${beneficiaire.nom} pour le tour ${tour.numeroTour}`);

    res.json({
      success: true,
      message: `Cagnotte de ${montantPot.toLocaleString('fr-FR')} XOF versée avec succès à ${beneficiaire.prenom} ${beneficiaire.nom} !`,
      tour,
      transaction,
      tontineStatut: tontine.statut,
      prochainTourNumero: prochainTour ? prochainNumero : null,
    });
  } catch (error: any) {
    console.error('Payout tour error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du versement de la cagnotte', error: error.message });
  }
}
