import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface ILitigeDocument extends Document {
  tontine: mongoose.Types.ObjectId;
  declarePar: mongoose.Types.ObjectId;
  membreConcerne?: mongoose.Types.ObjectId;
  titre: string;
  description: string;
  statut: 'ouvert' | 'en_mediation' | 'resolu' | 'rejete';
  resolution?: string;
  dateDeclaration: Date;
  dateResolution?: Date;
}

const LitigeSchema = new Schema<ILitigeDocument>(
  {
    tontine: { type: Schema.Types.ObjectId, ref: 'Tontine', required: true },
    declarePar: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    membreConcerne: { type: Schema.Types.ObjectId, ref: 'User' },
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    statut: {
      type: String,
      enum: ['ouvert', 'en_mediation', 'resolu', 'rejete'],
      default: 'ouvert',
    },
    resolution: { type: String },
    dateDeclaration: { type: Date, default: Date.now },
    dateResolution: { type: Date },
  },
  {
    timestamps: true,
  }
);

LitigeSchema.index({ tontine: 1, statut: 1 });
LitigeSchema.index({ declarePar: 1 });
LitigeSchema.index({ createdAt: -1 });

export const Litige: any = mongoose.models.Litige || mongoose.model<ILitigeDocument>('Litige', LitigeSchema);
