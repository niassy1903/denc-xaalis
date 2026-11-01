import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.ts';
import { RevokedToken } from '../models/RevokedToken.model.ts';
import type { AuthRequest } from '../middlewares/auth.middleware.ts';
import { logAudit } from '../middlewares/role.middleware.ts';
import { sendWelcomeEmail } from '../services/email.service.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'denc_xaalis_jwt_secret_super_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'denc_xaalis_jwt_refresh_secret_super_key_2026';

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign({ id: userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// Generate an anti-bot CAPTCHA challenge
export function getCaptcha(req: Request, res: Response): void {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const operators = ['+', '-', '*'];
  const op = operators[Math.floor(Math.random() * (operators.length - 1))]; // mostly + and -

  let result = a + b;
  if (op === '-') {
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    result = max - min;
    const question = `Combien font ${max} - ${min} ?`;
    const token = jwt.sign({ answer: result.toString() }, JWT_SECRET, { expiresIn: '10m' });
    res.json({ success: true, question, token });
    return;
  }

  const question = `Combien font ${a} + ${b} ?`;
  const token = jwt.sign({ answer: (a + b).toString() }, JWT_SECRET, { expiresIn: '10m' });
  res.json({ success: true, question, token });
}

function verifyCaptcha(captchaAnswer?: string, captchaToken?: string): boolean {
  if (!captchaAnswer || !captchaToken) return true; // graceful fallback if client doesn't send captcha
  try {
    const decoded = jwt.verify(captchaToken, JWT_SECRET) as { answer: string };
    return decoded.answer.trim() === captchaAnswer.toString().trim();
  } catch {
    return false;
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { nom, prenom, email, telephone, motDePasse, captchaAnswer, captchaToken, cguAccepted } = req.body;

    if (!nom || !prenom || !email || !telephone || !motDePasse) {
      res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis' });
      return;
    }

    if (captchaToken && !verifyCaptcha(captchaAnswer, captchaToken)) {
      res.status(400).json({ success: false, message: 'Échec de la validation CAPTCHA (Protection anti-robot)' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, salt);

    // L'inscription publique crée strictement des comptes clients / membres
    const user = await User.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.toLowerCase().trim(),
      telephone: telephone.trim(),
      motDePasseHash,
      role: 'membre',
      statut: 'actif',
      soldePortefeuille: 100000, // Solde de bienvenue
      emailVerifie: true,
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    await logAudit(user._id.toString(), 'INSCRIPTION', req.ip || '127.0.0.1', `Nouvel utilisateur créé: ${email}`);

    // Envoi de l'email de bienvenue via Resend
    sendWelcomeEmail(user.email, `${user.prenom} ${user.nom}`).catch((err) => console.error('[Resend Welcome Email Error]:', err));

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        statut: user.statut,
        dateInscription: user.createdAt,
        soldePortefeuille: user.soldePortefeuille,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription', error: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, telephone, motDePasse, captchaAnswer, captchaToken } = req.body;
    const identifier = (email || telephone || '').toString().trim();

    if (!identifier || !motDePasse) {
      res.status(400).json({ success: false, message: 'Veuillez saisir votre email ou téléphone ainsi que votre mot de passe' });
      return;
    }

    if (captchaToken && !verifyCaptcha(captchaAnswer, captchaToken)) {
      res.status(400).json({ success: false, message: 'Échec de la validation CAPTCHA (Protection anti-robot)' });
      return;
    }

    // Recherche par email ou par téléphone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { telephone: identifier },
        { telephone: identifier.replace(/\s+/g, '') },
      ],
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Identifiants invalides (email ou téléphone non trouvé)' });
      return;
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasseHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
      return;
    }

    if (user.statut === 'suspendu') {
      res.status(403).json({ success: false, message: 'Votre compte est suspendu. Veuillez contacter l\'administrateur.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    await logAudit(user._id.toString(), 'CONNEXION', req.ip || '127.0.0.1', `Connexion réussie: ${user.email} (${user.role})`);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        statut: user.statut,
        dateInscription: user.createdAt,
        photoProfil: user.photoProfil,
        soldePortefeuille: user.soldePortefeuille,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion', error: error.message });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    res.json({
      success: true,
      user: {
        _id: req.user._id,
        nom: req.user.nom,
        prenom: req.user.prenom,
        email: req.user.email,
        telephone: req.user.telephone,
        role: req.user.role,
        statut: req.user.statut,
        dateInscription: req.user.createdAt,
        photoProfil: req.user.photoProfil,
        soldePortefeuille: req.user.soldePortefeuille,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nom, prenom, telephone, photoProfil } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (telephone) user.telephone = telephone;
    if (photoProfil !== undefined) user.photoProfil = photoProfil;

    await user.save();

    await logAudit(user._id.toString(), 'MODIF_PROFIL', req.ip || '127.0.0.1', 'Profil mis à jour');

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        statut: user.statut,
        dateInscription: user.createdAt,
        photoProfil: user.photoProfil,
        soldePortefeuille: user.soldePortefeuille,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour profil', error: error.message });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Invalidate and blacklist token
    if (token) {
      try {
        const decoded = jwt.decode(token) as { exp?: number; id?: string };
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000);
        await RevokedToken.create({
          token,
          userId: decoded?.id,
          expiresAt,
        });
      } catch (tokErr) {
        // Token format error ignored on logout
      }
    }

    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Déconnexion réussie et session sécurisée révoquée' });
  } catch (err: any) {
    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Déconnexion effectuée' });
  }
}
