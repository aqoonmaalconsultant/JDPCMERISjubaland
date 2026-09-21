import mongoose from 'mongoose';

const financialTransactionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: {
      type: String,
      enum: ['Budget', 'Disbursement', 'Expenditure'],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    transactionDate: { type: Date, required: true },
    fundingSource: String,
    description: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

financialTransactionSchema.index({ project: 1, type: 1, transactionDate: -1 });

export const FinancialTransaction = mongoose.model('FinancialTransaction', financialTransactionSchema);
