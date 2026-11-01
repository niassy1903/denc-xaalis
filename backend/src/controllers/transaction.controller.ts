import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.ts';
import { Transaction } from '../models/Transaction.model.ts';
import { User } from '../models/User.model.ts';
import { logAudit } from '../middlewares/role.middleware.ts';

export async function getMyTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .populate('tontine', 'nom')
      .sort({ createdAt: -1 });

    res.json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur transactions', error: error.message });
  }
}

export async function depositWallet(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { montant, moyenPaiement } = req.body;

    if (!montant || Number(montant) <= 0) {
      res.status(400).json({ success: false, message: 'Montant de recharge invalide' });
      return;
    }

    const amount = Number(montant);
    const moyen = moyenPaiement || 'Wave';
    const ref = 'DEP-' + Date.now().toString(36).toUpperCase();

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    user.soldePortefeuille = (user.soldePortefeuille || 0) + amount;
    await user.save();

    const tx = await Transaction.create({
      type: 'depot_portefeuille',
      montant: amount,
      reference: ref,
      user: req.userId,
      statut: 'succes',
      moyenPaiement: moyen,
      description: `Recharge portefeuille via ${moyen}`,
    });

    await logAudit(req.userId, 'RECHARGE_PORTEFEUILLE', req.ip || '127.0.0.1', `Recharge ${amount} XOF via ${moyen}`);

    res.json({
      success: true,
      message: `Portefeuille rechargé de ${amount.toLocaleString('fr-FR')} XOF avec succès !`,
      soldePortefeuille: user.soldePortefeuille,
      transaction: tx,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur recharge', error: error.message });
  }
}
