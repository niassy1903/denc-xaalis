import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionDocument extends Document {
  type: 'cotisation' | 'versement_beneficiaire' | 'penalite' | 'depot_portefeuille' | 'retrait';
  montant: number;
  reference: string;
  tontine?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  statut: 'succes' | 'en_cours' | 'echec';
  moyenPaiement: string;
  description?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    type: {
      type: String,
      enum: ['cotisation', 'versement_beneficiaire', 'penalite', 'depot_portefeuille', 'retrait'],
      required: true,
    },
    montant: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    tontine: { type: Schema.Types.ObjectId, ref: 'Tontine' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    statut: {
      type: String,
      enum: ['succes', 'en_cours', 'echec'],
      default: 'succes',
    },
    moyenPaiement: { type: String, default: 'Wave' },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ tontine: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, statut: 1 });

export const Transaction: any = mongoose.models.Transaction || mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
