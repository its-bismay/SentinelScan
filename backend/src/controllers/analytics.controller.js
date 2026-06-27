import Scan from '../models/Scan.js';
import Finding from '../models/Finding.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalScans, scans, topFindings] = await Promise.all([
      Scan.countDocuments({ userId }),
      Scan.find({ userId, status: 'completed' })
        .select('score grade createdAt criticalCount highCount mediumCount lowCount infoCount targetUrl')
        .sort({ createdAt: -1 })
        .limit(50),
      Finding.aggregate([
        {
          $lookup: {
            from: 'scans',
            localField: 'scanId',
            foreignField: '_id',
            as: 'scan',
          },
        },
        { $unwind: '$scan' },
        { $match: { 'scan.userId': userId } },
        { $group: { _id: '$title', count: { $sum: 1 }, severity: { $first: '$severity' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const avgScore = scans.length
      ? Math.round(scans.reduce((s, sc) => s + (sc.score || 0), 0) / scans.length)
      : 0;

    const severityTotals = scans.reduce(
      (acc, sc) => {
        acc.critical += sc.criticalCount || 0;
        acc.high += sc.highCount || 0;
        acc.medium += sc.mediumCount || 0;
        acc.low += sc.lowCount || 0;
        acc.info += sc.infoCount || 0;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    );

    // Last 30 days trend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trend = await Scan.aggregate([
      { $match: { userId, status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({
      success: true,
      analytics: {
        totalScans,
        completedScans: scans.length,
        avgScore,
        severityTotals,
        topFindings,
        trend,
        recentScans: scans.slice(0, 5),
      },
    });
  } catch (err) {
    next(err);
  }
};
