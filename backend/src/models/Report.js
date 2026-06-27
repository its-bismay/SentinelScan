import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    format: { type: String, enum: ['pdf', 'json'], default: 'json' },
    summary: { type: String },
    executiveSummary: { type: String },
    aiAnalysis: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
