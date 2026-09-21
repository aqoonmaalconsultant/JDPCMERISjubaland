import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }
  },
  { timestamps: true }
);

export const Region = mongoose.model('Region', regionSchema);
