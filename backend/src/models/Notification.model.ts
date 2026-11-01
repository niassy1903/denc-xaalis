import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  destinataire: mongoose.Types.ObjectId;
  type: 'echeance' | 'tour_recu' | 'retard' | 'invitation' | 'litige' | 'systeme';
  titre: string;
  message: string;
  lu: boolean;
  lien?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    destinataire: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['echeance', 'tour_recu', 'retard', 'invitation', 'litige', 'systeme'],
      default: 'systeme',
    },
    titre: { type: String, required: true },
    message: { type: String, required: true },
    lu: { type: Boolean, default: false },
    lien: { type: String },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ destinataire: 1, lu: 1, createdAt: -1 });
NotificationSchema.index({ destinataire: 1, createdAt: -1 });

export const Notification: any = mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
