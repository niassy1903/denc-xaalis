import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.ts';
import { AuditLog } from '../models/AuditLog.model.ts';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Accès refusé : rôle requis (${allowedRoles.join(', ')}). Votre rôle actuel : ${req.user?.role || 'aucun'}`,
      });
      return;
    }
    next();
  };
}

export async function logAudit(userId: string | undefined, action: string, ip: string, details?: string) {
  try {
    await AuditLog.create({
      utilisateur: userId,
      action,
      ip: ip || '127.0.0.1',
      details,
    });
  } catch (err) {
    console.error('AuditLog error:', err);
  }
}
