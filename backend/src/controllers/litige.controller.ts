import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.ts';
import { Litige } from '../models/Litige.model.ts';
import { Tontine } from '../models/Tontine.model.ts';
import { Notification } from '../models/Notification.model.ts';
import { logAudit } from '../middlewares/role.middleware.ts';

export async function getLitigesByTontine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { tontineId } = req.params;
    const litiges = await Litige.find({ tontine: tontineId })
      .populate('declarePar', 'nom prenom email telephone')
      .populate('membreConcerne', 'nom prenom email telephone')
      .sort({ createdAt: -1 });

    res.json({ success: true, litiges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur litiges', error: error.message });
  }
}

export async function createLitige(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { tontineId, membreConcerneId, titre, description } = req.body;

    if (!tontineId || !titre || !description) {
      res.status(400).json({ success: false, message: 'Tontine, titre et description sont obligatoires' });
      return;
    }

    const tontine = await Tontine.findById(tontineId);
    if (!tontine) {
      res.status(404).json({ success: false, message: 'Tontine introuvable' });
      return;
    }

    const litige = await Litige.create({
      tontine: tontineId,
      declarePar: req.userId,
      membreConcerne: membreConcerneId || undefined,
      titre,
      description,
      statut: 'ouvert',
      dateDeclaration: new Date(),
    });

    // Notifier le président
    if (tontine.president.toString() !== req.userId) {
      await Notification.create({
        destinataire: tontine.president,
        type: 'litige',
        titre: 'Nouveau litige signalé',
        message: `Un litige "${titre}" a été ouvert dans la tontine "${tontine.nom}".`,
        lien: `/tontines/${tontine._id}`,
      });
    }

    await logAudit(req.userId, 'CREATION_LITIGE', req.ip || '127.0.0.1', `Litige ouvert: ${titre}`);

    res.status(201).json({
      success: true,
      message: 'Litige enregistré avec succès. Le bureau de la tontine a été notifié pour médiation.',
      litige,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur création litige', error: error.message });
  }
}

export async function resolveLitige(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { litigeId } = req.params;
    const { statut, resolution } = req.body;

    const litige = await Litige.findById(litigeId).populate('tontine');
    if (!litige) {
      res.status(404).json({ success: false, message: 'Litige introuvable' });
      return;
    }

    const tontine = litige.tontine as any;
    if (tontine.president.toString() !== req.userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Seul le président ou un administrateur peut arbitrer ce litige' });
      return;
    }

    litige.statut = statut || 'resolu';
    litige.resolution = resolution || 'Résolution validée par arbitrage.';
    litige.dateResolution = new Date();
    await litige.save();

    await Notification.create({
      destinataire: litige.declarePar,
      type: 'litige',
      titre: 'Litige résolu',
      message: `Votre litige "${litige.titre}" a été mis à jour: ${litige.statut}.`,
      lien: `/tontines/${tontine._id}`,
    });

    await logAudit(req.userId, 'RESOLUTION_LITIGE', req.ip || '127.0.0.1', `Litige ${litige.titre} résolu: ${statut}`);

    res.json({ success: true, message: 'Litige mis à jour avec succès', litige });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur résolution litige', error: error.message });
  }
}
