import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true }
  },
  { timestamps: true }
);

districtSchema.index({ region: 1, name: 1 }, { unique: true });
districtSchema.index({ region: 1, code: 1 }, { unique: true });

export const District = mongoose.model('District', districtSchema);
