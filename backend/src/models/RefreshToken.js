import crypto from 'crypto';
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    replacedByTokenHash: String,
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

refreshTokenSchema.index({ user: 1, revokedAt: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
