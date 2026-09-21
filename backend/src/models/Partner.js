import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['NGO', 'UN Agency', 'Contractor', 'Government', 'Private', 'Other'], default: 'NGO' },
    contact: {
      email: String,
      phone: String,
      address: String
    }
  },
  { timestamps: true }
);

export const Partner = mongoose.model('Partner', partnerSchema);
