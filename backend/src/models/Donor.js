import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    country: String,
    contactPerson: String,
    email: String,
    phone: String
  },
  { timestamps: true }
);

export const Donor = mongoose.model('Donor', donorSchema);
