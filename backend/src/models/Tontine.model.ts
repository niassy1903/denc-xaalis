import mongoose, { Schema, Document } from 'mongoose';

export interface ITontineDocument extends Document {
  nom: string;
  description: string;
  montantCotisation: number;
  frequence: 'hebdomadaire' | 'mensuelle' | 'bimensuelle';
  devise: string;
  dateDebut: Date;
  statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  president: mongoose.Types.ObjectId;
  nombreMembresMax: number;
  regles?: string;
  codeInvitation: string;
  fondsTotalCollecte: number;
  tourActuelNumero: number;
}

const TontineSchema = new Schema<ITontineDocument>(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    montantCotisation: { type: Number, required: true, min: 1000 },
    frequence: {
      type: String,
      enum: ['hebdomadaire', 'mensuelle', 'bimensuelle'],
      default: 'mensuelle',
    },
    devise: { type: String, default: 'XOF' },
    dateDebut: { type: Date, default: Date.now },
    statut: {
      type: String,
      enum: ['en_attente', 'en_cours', 'terminee', 'annulee'],
      default: 'en_attente',
    },
    president: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nombreMembresMax: { type: Number, required: true, default: 5 },
    regles: { type: String, default: '' },
    codeInvitation: { type: String, required: true, unique: true, uppercase: true, index: true },
    fondsTotalCollecte: { type: Number, default: 0 },
    tourActuelNumero: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes
TontineSchema.index({ president: 1, statut: 1 });
TontineSchema.index({ statut: 1, dateDebut: -1 });
TontineSchema.index({ createdAt: -1 });

export const Tontine: any = mongoose.models.Tontine || mongoose.model<ITontineDocument>('Tontine', TontineSchema);
