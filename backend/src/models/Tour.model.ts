import mongoose, { Schema, Document } from 'mongoose';

export interface ITourDocument extends Document {
  tontine: mongoose.Types.ObjectId;
  numeroTour: number;
  beneficiaire: mongoose.Types.ObjectId;
  datePrevue: Date;
  dateEffective?: Date;
  montantTotal: number;
  cotisationsRecues: number;
  statut: 'a_venir' | 'en_cours' | 'attribue' | 'reporte';
}

const TourSchema = new Schema<ITourDocument>(
  {
    tontine: { type: Schema.Types.ObjectId, ref: 'Tontine', required: true },
    numeroTour: { type: Number, required: true },
    beneficiaire: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    datePrevue: { type: Date, required: true },
    dateEffective: { type: Date },
    montantTotal: { type: Number, required: true },
    cotisationsRecues: { type: Number, default: 0 },
    statut: {
      type: String,
      enum: ['a_venir', 'en_cours', 'attribue', 'reporte'],
      default: 'a_venir',
    },
  },
  {
    timestamps: true,
  }
);

TourSchema.index({ tontine: 1, numeroTour: 1 }, { unique: true });
TourSchema.index({ tontine: 1, statut: 1 });
TourSchema.index({ beneficiaire: 1, statut: 1 });

export const Tour: any = mongoose.models.Tour || mongoose.model<ITourDocument>('Tour', TourSchema);
