import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import type { AuthRequest } from '../middlewares/auth.middleware.ts';
import { User } from '../models/User.model.ts';
import { Tontine } from '../models/Tontine.model.ts';
import { Membre } from '../models/Membre.model.ts';
import { Cotisation } from '../models/Cotisation.model.ts';
import { Transaction } from '../models/Transaction.model.ts';
import { Litige } from '../models/Litige.model.ts';
import { AuditLog } from '../models/AuditLog.model.ts';
import { logAudit } from '../middlewares/role.middleware.ts';

export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const totalUsers = await User.countDocuments();
    const totalTontines = await Tontine.countDocuments();
    const tontinesActives = await Tontine.countDocuments({ statut: 'en_cours' });
    
    // Calcul volume total cotisé
    const cotisationsPayees = await Cotisation.find({ statut: 'paye' });
    const volumeTotalCotise = cotisationsPayees.reduce((acc, c) => acc + (c.montant || 0), 0);

    // Calcul volume versé bénéficiaires
    const versements = await Transaction.find({ type: 'versement_beneficiaire', statut: 'succes' });
    const volumeVerseBeneficiaires = versements.reduce((acc, v) => acc + (v.montant || 0), 0);

    // Taux de recouvrement
    const totalCotisationsCount = await Cotisation.countDocuments();
    const payeesCount = cotisationsPayees.length;
    const tauxRecouvrement = totalCotisationsCount > 0 ? Math.round((payeesCount / totalCotisationsCount) * 100) : 100;

    const litigesEnCours = await Litige.countDocuments({ statut: { $in: ['ouvert', 'en_mediation'] } });
    const recentTransactionsCount = await Transaction.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTontines,
        tontinesActives,
        volumeTotalCotise,
        volumeVerseBeneficiaires,
        tauxRecouvrement,
        litigesEnCours,
        recentTransactionsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur stats admin', error: error.message });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, role, statut } = req.query;
    const filter: any = {};

    if (role && role !== 'all') filter.role = role;
    if (statut && statut !== 'all') filter.statut = statut;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-motDePasseHash').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur liste utilisateurs', error: error.message });
  }
}

export async function updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { statut } = req.body;

    if (!['actif', 'suspendu', 'en_attente'].includes(statut)) {
      res.status(400).json({ success: false, message: 'Statut invalide' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { statut }, { new: true }).select('-motDePasseHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    await logAudit(req.userId, 'MODIF_STATUT_USER', req.ip || '127.0.0.1', `Statut de ${user.email} changé en ${statut}`);

    res.json({ success: true, message: `Statut utilisateur mis à jour : ${statut}`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur modification statut', error: error.message });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'president_tontine', 'membre'].includes(role)) {
      res.status(400).json({ success: false, message: 'Rôle invalide' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-motDePasseHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    await logAudit(req.userId, 'MODIF_ROLE_USER', req.ip || '127.0.0.1', `Rôle de ${user.email} changé en ${role}`);

    res.json({ success: true, message: `Rôle utilisateur mis à jour : ${role}`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur modification rôle', error: error.message });
  }
}

export async function getAllTontinesAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tontines = await Tontine.find()
      .populate('president', 'nom prenom email telephone')
      .sort({ createdAt: -1 });

    const withStats = await Promise.all(
      tontines.map(async (t) => {
        const count = await Membre.countDocuments({ tontine: t._id });
        return { ...t.toObject(), membresCount: count };
      })
    );

    res.json({ success: true, tontines: withStats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur tontines admin', error: error.message });
  }
}

export async function getAllTransactionsAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'nom prenom email telephone')
      .populate('tontine', 'nom')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur transactions admin', error: error.message });
  }
}

export async function getAllLitigesAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const litiges = await Litige.find()
      .populate('tontine', 'nom')
      .populate('declarePar', 'nom prenom email telephone')
      .populate('membreConcerne', 'nom prenom email telephone')
      .sort({ createdAt: -1 });

    res.json({ success: true, litiges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur litiges admin', error: error.message });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const logs = await AuditLog.find()
      .populate('utilisateur', 'nom prenom email role')
      .sort({ createdAt: -1 })
      .limit(150);

    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur logs audit', error: error.message });
  }
}

export async function createAdminUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nom, prenom, email, telephone, motDePasse } = req.body;

    if (!nom || !prenom || !email || !telephone || !motDePasse) {
      res.status(400).json({ success: false, message: 'Tous les champs (nom, prénom, email, téléphone, mot de passe) sont obligatoires pour créer un administrateur' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cette adresse email existe déjà' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, salt);

    const newAdmin = await User.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      motDePasseHash,
      role: 'admin',
      statut: 'actif',
      soldePortefeuille: 250000,
      emailVerifie: true,
    });

    await logAudit(
      req.userId,
      'CREATION_ADMIN',
      req.ip || '127.0.0.1',
      `Nouvel administrateur créé: ${newAdmin.prenom} ${newAdmin.nom} (${newAdmin.email})`
    );

    res.status(201).json({
      success: true,
      message: `Administrateur ${newAdmin.prenom} ${newAdmin.nom} créé avec succès !`,
      user: {
        _id: newAdmin._id,
        nom: newAdmin.nom,
        prenom: newAdmin.prenom,
        email: newAdmin.email,
        telephone: newAdmin.telephone,
        role: newAdmin.role,
        statut: newAdmin.statut,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'administrateur', error: error.message });
  }
}
