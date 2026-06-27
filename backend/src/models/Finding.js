import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema(
  {
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'informational'],
      required: true,
      index: true,
    },
    cwe: { type: String }, // e.g., "CWE-16"
    owasp: { type: String }, // e.g., "A05:2021"
    affectedUrl: { type: String },
    evidence: { type: String }, // Raw header value, response snippet, etc.
    remediation: { type: String },
    references: [{ type: String }],
    category: { type: String }, // "headers", "cookies", "ssl", etc.
  },
  { timestamps: true }
);

const Finding = mongoose.model('Finding', findingSchema);
export default Finding;
