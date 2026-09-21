import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    evaluationType: {
      type: String,
      enum: ['Baseline Evaluation', 'Midterm Evaluation', 'Final Evaluation', 'Impact Evaluation'],
      required: true
    },
    evaluationDate: { type: Date, required: true },
    evaluatorName: { type: String, required: true, trim: true },
    findings: String,
    lessonsLearned: String,
    recommendations: String,
    score: { type: Number, min: 0, max: 100, default: 0 },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

evaluationSchema.index({ project: 1, evaluationType: 1, evaluationDate: -1 });

export const Evaluation = mongoose.model('Evaluation', evaluationSchema);
