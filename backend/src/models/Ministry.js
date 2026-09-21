import mongoose from 'mongoose';

const ministrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    minister: String,
    directorGeneral: String,
    contact: {
      email: String,
      phone: String,
      address: String
    }
  },
  { timestamps: true }
);

export const Ministry = mongoose.model('Ministry', ministrySchema);
