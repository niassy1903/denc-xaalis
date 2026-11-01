import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User.model.ts';
import { RevokedToken } from '../models/RevokedToken.model.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'denc_xaalis_jwt_secret_super_key_2026';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  userId?: string;
  userRole?: string;
  token?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Accès non autorisé : Token d\'authentification manquant',
      });
      return;
    }

    // Check if token has been revoked / blacklisted (e.g. after logout)
    const isRevoked = await RevokedToken.findOne({ token });
    if (isRevoked) {
      res.status(401).json({
        success: false,
        message: 'Session expirée ou révoquée suite à une déconnexion sécurisée',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    // Find user in database
    const user = await User.findById(decoded.id).select('-motDePasseHash');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable ou compte désactivé',
      });
      return;
    }

    if (user.statut === 'suspendu') {
      res.status(403).json({
        success: false,
        message: 'Ce compte utilisateur a été suspendu par l\'administrateur',
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    req.token = token;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token d\'authentification invalide ou expiré',
      error: error.message,
    });
  }
}
