import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number }, // ms

    // Results
    score: { type: Number, min: 0, max: 100 },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'] },
    highCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
    infoCount: { type: Number, default: 0 },
    criticalCount: { type: Number, default: 0 },

    // Crawl data
    crawledUrls: [{ type: String }],
    totalUrlsFound: { type: Number, default: 0 },

    // Tech fingerprint
    techStack: [{ type: String }],
    serverInfo: { type: String },

    // Options used during scan
    options: {
      ignoreRobots: { type: Boolean, default: false },
      maxDepth: { type: Number, default: 3 },
      maxUrls: { type: Number, default: 50 },
      headlessScan: { type: Boolean, default: false },
    },

    // Error info
    errorMessage: { type: String },

    findings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Finding' }],
  },
  { timestamps: true }
);

const Scan = mongoose.model('Scan', scanSchema);
export default Scan;
