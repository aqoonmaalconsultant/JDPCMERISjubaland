import mongoose from 'mongoose';

const monitoringReportSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    physicalProgress: { type: Number, min: 0, max: 100, required: true },
    financialProgress: { type: Number, min: 0, max: 100, required: true },
    timelineProgress: { type: Number, min: 0, max: 100, required: true },
    trafficLight: { type: String, enum: ['Green', 'Yellow', 'Red'], required: true },
    risks: [String],
    challenges: [String],
    recommendations: [String],
    findings: String,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  },
  { timestamps: true }
);

export const MonitoringReport = mongoose.model('MonitoringReport', monitoringReportSchema);
