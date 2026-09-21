import mongoose from 'mongoose';

const villageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true }
  },
  { timestamps: true }
);

villageSchema.index({ district: 1, name: 1 }, { unique: true });
villageSchema.index({ district: 1, code: 1 }, { unique: true });

export const Village = mongoose.model('Village', villageSchema);
