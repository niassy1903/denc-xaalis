import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  utilisateur?: mongoose.Types.ObjectId;
  action: string;
  ip: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    utilisateur: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    ip: { type: String, default: '127.0.0.1' },
    details: { type: String },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ utilisateur: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog: any = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
