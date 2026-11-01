import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.ts';
import { Notification } from '../models/Notification.model.ts';

export async function getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notifications = await Notification.find({ destinataire: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const nonLuesCount = await Notification.countDocuments({ destinataire: req.userId, lu: false });

    res.json({ success: true, notifications, nonLuesCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur notifications', error: error.message });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, destinataire: req.userId }, { lu: true });
    res.json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour notification', error: error.message });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await Notification.updateMany({ destinataire: req.userId, lu: false }, { lu: true });
    res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour notifications', error: error.message });
  }
}
