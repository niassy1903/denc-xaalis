import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface ICotisationDocument extends Document {
  tontine: mongoose.Types.ObjectId;
  membre: mongoose.Types.ObjectId;
  tour: mongoose.Types.ObjectId;
  montant: number;
  datePaiement?: Date;
  dateEcheance: Date;
  moyenPaiement: string;
  statut: 'paye' | 'en_retard' | 'impaye' | 'en_validation';
  justificatif?: string;
  referencePaiement?: string;
  valideParPresident: boolean;
}

const CotisationSchema = new Schema<ICotisationDocument>(
  {
    tontine: { type: Schema.Types.ObjectId, ref: 'Tontine', required: true },
    membre: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    montant: { type: Number, required: true },
    datePaiement: { type: Date },
    dateEcheance: { type: Date, required: true },
    moyenPaiement: { type: String, default: 'Wave' },
    statut: {
      type: String,
      enum: ['paye', 'en_retard', 'impaye', 'en_validation'],
      default: 'impaye',
    },
    justificatif: { type: String },
    referencePaiement: { type: String },
    valideParPresident: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

CotisationSchema.index({ tontine: 1, tour: 1, membre: 1 }, { unique: true });
CotisationSchema.index({ membre: 1, statut: 1 });
CotisationSchema.index({ tontine: 1, statut: 1 });
CotisationSchema.index({ tour: 1, statut: 1 });
CotisationSchema.index({ dateEcheance: 1 });

export const Cotisation: any = mongoose.models.Cotisation || mongoose.model<ICotisationDocument>('Cotisation', CotisationSchema);
