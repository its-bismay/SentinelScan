import Scan from '../models/Scan.js';
import Report from '../models/Report.js';
import { analyzeWithGroq, chatAboutScan } from '../services/groq.service.js';


// POST /api/reports/generate/:scanId — AI Analysis
export const generateReport = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.scanId, userId: req.user._id }).populate('findings');
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    if (scan.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Scan not completed yet' });
    }

    const existing = await Report.findOne({ scanId: scan._id, userId: req.user._id });
    if (existing) return res.json({ success: true, report: existing });

    const aiAnalysis = await analyzeWithGroq({
      targetUrl: scan.targetUrl,
      score: scan.score,
      grade: scan.grade,
      findings: scan.findings,
    });

    const report = await Report.create({
      scanId: scan._id,
      userId: req.user._id,
      aiAnalysis,
      summary: `Security scan of ${scan.targetUrl} completed with score ${scan.score}/100 (${scan.grade})`,
      generatedAt: new Date(),
    });

    return res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/:scanId
export const getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ scanId: req.params.scanId, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found. Generate it first.' });
    return res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// POST /api/reports/analyze — AI Assistant Q&A
export const askAssistant = async (req, res, next) => {
  try {
    const { scanId, question, chatHistory } = req.body;
    if (!scanId || !question) {
      return res.status(400).json({ success: false, message: 'scanId and question are required' });
    }

    const scan = await Scan.findOne({ _id: scanId, userId: req.user._id }).populate('findings');
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });

    const answer = await chatAboutScan(
      {
        targetUrl: scan.targetUrl,
        score: scan.score,
        grade: scan.grade,
        findings: scan.findings,
      },
      question,
      chatHistory
    );

    return res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
};

