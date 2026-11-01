import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IRevokedTokenDocument extends Document {
  token: string;
  userId?: mongoose.Types.ObjectId;
  expiresAt: Date;
  revokedAt: Date;
}

const RevokedTokenSchema = new Schema<IRevokedTokenDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// TTL Index: automatically remove documents when expiresAt is reached
RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedToken: any =
  mongoose.models.RevokedToken || mongoose.model<IRevokedTokenDocument>('RevokedToken', RevokedTokenSchema);
