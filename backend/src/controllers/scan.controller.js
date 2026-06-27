import Scan from '../models/Scan.js';
import Finding from '../models/Finding.js';
import ScanLog from '../models/ScanLog.js';
import User from '../models/User.js';
import { inngest } from '../services/inngest.js';
import { validateUrl } from '../utils/urlValidator.js';

// POST /api/scans — Create new scan
export const createScan = async (req, res, next) => {
  try {
    const { targetUrl, options = {} } = req.body;
    const validation = validateUrl(targetUrl);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.reason });
    }

    const scan = await Scan.create({
      userId: req.user._id,
      targetUrl: validation.url,
      status: 'queued',
      options: {
        ignoreRobots: options.ignoreRobots || false,
        maxDepth: Math.min(options.maxDepth || 3, 5),
        maxUrls: Math.min(options.maxUrls || 50, 100),
        headlessScan: options.headlessScan || false,
      },
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalScans: 1 } });

    // Try to dispatch via Inngest; fall back to direct in-process execution
    // when the Inngest Dev Server is not running (common in dev without the CLI).
    try {
      await inngest.send({ name: 'scan/queued', data: { scanId: scan._id.toString() } });
    } catch (inngestErr) {
      console.warn('[WARN] Inngest unavailable — running scan pipeline directly:', inngestErr.message);
      // Import lazily to avoid circular deps
      const { runScanPipeline } = await import('../services/scanPipeline.js');
      setImmediate(() => runScanPipeline(scan._id.toString()).catch(console.error));
    }

    return res.status(201).json({ success: true, scan });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans — List user's scans
export const getScans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (search) filter.targetUrl = { $regex: search, $options: 'i' };

    const total = await Scan.countDocuments(filter);
    const scans = await Scan.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-findings -crawledUrls');

    return res.json({ success: true, scans, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans/:id — Get single scan with findings
export const getScan = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id }).populate('findings');
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    return res.json({ success: true, scan });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scans/:id
export const deleteScan = async (req, res, next) => {
  try {
    const scan = await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    await Finding.deleteMany({ scanId: req.params.id });
    await ScanLog.deleteMany({ scanId: req.params.id });
    return res.json({ success: true, message: 'Scan deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans/:id/progress — SSE stream
export const getScanProgress = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Must use specific origin (not '*') when the client sends withCredentials cookies
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.flushHeaders();

    let lastId = null;
    let pollCount = 0;
    const MAX_POLLS = 120; // 10 minutes max

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    const poll = async () => {
      if (pollCount++ > MAX_POLLS) {
        send({ type: 'timeout' });
        return res.end();
      }

      const query = { scanId: req.params.id };
      if (lastId) query._id = { $gt: lastId };

      const logs = await ScanLog.find(query).sort({ _id: 1 }).limit(50);
      for (const log of logs) {
        send({ type: 'log', message: log.message, level: log.level, timestamp: log.timestamp });
        lastId = log._id;
      }

      const current = await Scan.findById(req.params.id).select('status score grade');
      send({ type: 'status', status: current.status, score: current.score, grade: current.grade });

      if (current.status === 'completed' || current.status === 'failed') {
        send({ type: 'done', status: current.status });
        return res.end();
      }

      setTimeout(poll, 2000); // poll every 2s for snappier log updates
    };

    poll();
    req.on('close', () => res.end());
  } catch (err) {
    next(err);
  }
};
