import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Contract', 'Agreement', 'Report', 'Photo', 'Video', 'Completion Certificate', 'Other'],
      default: 'Other'
    },
    fileName: String,
    mimeType: String,
    storageType: { type: String, enum: ['local', 'cloud'], default: 'local' },
    storageKey: String,
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

documentSchema.index({ project: 1, category: 1 });
documentSchema.index({ title: 'text', fileName: 'text' });

export const Document = mongoose.model('Document', documentSchema);
