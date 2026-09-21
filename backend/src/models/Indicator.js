import mongoose from 'mongoose';

const indicatorSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    level: {
      type: String,
      enum: ['Goal', 'Outcome', 'Output', 'Activity', 'Indicator'],
      default: 'Indicator'
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: String,
    unit: String,
    baseline: { type: Number, default: 0 },
    target: { type: Number, default: 0 },
    actual: { type: Number, default: 0 },
    achievementPercentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ON_TRACK', 'AT_RISK', 'OFF_TRACK'],
      default: 'OFF_TRACK'
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

indicatorSchema.pre('save', function calculateIndicatorStatus(next) {
  this.achievementPercentage = this.target > 0 ? Math.round((this.actual / this.target) * 100) : 0;

  if (this.achievementPercentage >= 80) {
    this.status = 'ON_TRACK';
  } else if (this.achievementPercentage >= 50) {
    this.status = 'AT_RISK';
  } else {
    this.status = 'OFF_TRACK';
  }

  next();
});

indicatorSchema.index({ project: 1, code: 1 }, { unique: true });
indicatorSchema.index({ project: 1, level: 1 });

export const Indicator = mongoose.model('Indicator', indicatorSchema);
