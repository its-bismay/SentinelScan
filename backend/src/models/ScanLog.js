import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema(
  {
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', required: true, index: true },
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const ScanLog = mongoose.model('ScanLog', scanLogSchema);
export default ScanLog;
