import mongoose, { Schema, Document } from 'mongoose';

export interface IMembreDocument extends Document {
  tontine: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: 'president' | 'secretaire' | 'tresorier' | 'membre';
  positionTirage: number;
  dateAdhesion: Date;
  statut: 'actif' | 'en_retard' | 'exclu' | 'en_attente';
  totalCotise: number;
  totalRecu: number;
}

const MembreSchema = new Schema<IMembreDocument>(
  {
    tontine: { type: Schema.Types.ObjectId, ref: 'Tontine', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['president', 'secretaire', 'tresorier', 'membre'],
      default: 'membre',
    },
    positionTirage: { type: Number, default: 1 },
    dateAdhesion: { type: Date, default: Date.now },
    statut: {
      type: String,
      enum: ['actif', 'en_retard', 'exclu', 'en_attente'],
      default: 'actif',
    },
    totalCotise: { type: Number, default: 0 },
    totalRecu: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Unicité d'un membre dans une tontine et indexes de requêtes
MembreSchema.index({ tontine: 1, user: 1 }, { unique: true });
MembreSchema.index({ user: 1, statut: 1 });
MembreSchema.index({ tontine: 1, statut: 1 });
MembreSchema.index({ tontine: 1, positionTirage: 1 });

export const Membre: any = mongoose.models.Membre || mongoose.model<IMembreDocument>('Membre', MembreSchema);
