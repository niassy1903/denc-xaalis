import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasseHash: string;
  role: 'admin' | 'president_tontine' | 'membre';
  statut: 'actif' | 'suspendu' | 'en_attente';
  dateInscription: Date;
  photoProfil?: string;
  soldePortefeuille: number;
  emailVerifie: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    telephone: { type: String, required: true, trim: true, index: true },
    motDePasseHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'president_tontine', 'membre'],
      default: 'membre',
      index: true,
    },
    statut: {
      type: String,
      enum: ['actif', 'suspendu', 'en_attente'],
      default: 'actif',
      index: true,
    },
    photoProfil: { type: String, default: '' },
    soldePortefeuille: { type: Number, default: 50000 },
    emailVerifie: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid lookup and filtering
UserSchema.index({ email: 1, statut: 1 });
UserSchema.index({ telephone: 1, statut: 1 });
UserSchema.index({ role: 1, statut: 1 });
UserSchema.index({ createdAt: -1 });

export const User: any = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
