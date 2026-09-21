import mongoose from 'mongoose';

const numberSequenceSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    currentValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Atomically increments a sequence and returns the next number.
 *
 * Example keys:
 * - ORGANIZATION-APPLICATION-2026
 * - ORGANIZATION-REGISTRATION-LNGO-2026
 * - ORGANIZATION-REGISTRATION-INGO-2026
 * - ORGANIZATION-REGISTRATION-LCOM-2026
 * - ORGANIZATION-REGISTRATION-ICOM-2026
 */
numberSequenceSchema.statics.getNextValue = async function getNextValue(key) {
  const normalizedKey = String(key || '').trim().toUpperCase();

  if (!normalizedKey) {
    throw new Error('Sequence key is required.');
  }

  const sequence = await this.findOneAndUpdate(
    { key: normalizedKey },
    {
      $inc: { currentValue: 1 },
      $setOnInsert: { key: normalizedKey },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!sequence) {
    throw new Error(`Unable to generate sequence for key: ${normalizedKey}`);
  }

  return sequence.currentValue;
};

const NumberSequence =
  mongoose.models.NumberSequence ||
  mongoose.model('NumberSequence', numberSequenceSchema);

export default NumberSequence;