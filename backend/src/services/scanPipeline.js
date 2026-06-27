/**
 * Scan Pipeline — orchestrates all scanners
 */
import { runCrawler } from './scanners/crawlerService.js';
import { runHeaderScanner } from './scanners/headerScanner.js';
import { runCookieScanner } from './scanners/cookieScanner.js';
import { runSslScanner } from './scanners/sslScanner.js';
import { runRobotsScanner } from './scanners/robotsScanner.js';
import { runClickjackingScanner } from './scanners/clickjackingScanner.js';
import { runCorsScanner } from './scanners/corsScanner.js';
import { runDirectoryScanner } from './scanners/directoryScanner.js';
import { runInfoLeakScanner } from './scanners/infoLeakScanner.js';
import { runPlaywrightScanner } from './scanners/playwrightScanner.js';
import { calculateScore } from './scoringEngine.js';
import ScanLog from '../models/ScanLog.js';
import Scan from '../models/Scan.js';
import Finding from '../models/Finding.js';
import logger from '../utils/logger.js';

const addLog = async (scanId, message, level = 'info', data = null) => {
  try {
    await ScanLog.create({ scanId, message, level, data });
  } catch { /* non-fatal */ }
};

export const runScanPipeline = async (scanId) => {
  const scan = await Scan.findById(scanId);
  if (!scan) throw new Error(`Scan ${scanId} not found`);

  const targetUrl = scan.targetUrl;
  const options = scan.options || {};
  const startTime = Date.now(); // capture before async updates to avoid NaN

  await Scan.findByIdAndUpdate(scanId, { status: 'running', startedAt: new Date() });
  await addLog(scanId, `Starting scan of ${targetUrl}`);

  const allFindings = [];
  let techStack = [];
  let crawledUrls = [];

  try {
    // Step 1: Crawl
    await addLog(scanId, 'Crawling target website...');
    const crawlData = await runCrawler(targetUrl, options);
    crawledUrls = crawlData.urls;
    await addLog(scanId, `Crawled ${crawledUrls.length} URLs, found ${crawlData.forms.length} forms`);
    await Scan.findByIdAndUpdate(scanId, { crawledUrls, totalUrlsFound: crawledUrls.length });

    // Step 2: Run all scanners in parallel on the root URL
    await addLog(scanId, 'Running security scanners...');
    const [
      headerFindings,
      cookieFindings,
      sslFindings,
      robotsFindings,
      clickjackFindings,
      corsFindings,
      dirFindings,
      infoLeakResult,
      playwrightFindings,
    ] = await Promise.allSettled([
      runHeaderScanner(targetUrl),
      runCookieScanner(targetUrl),
      runSslScanner(targetUrl),
      runRobotsScanner(targetUrl),
      runClickjackingScanner(targetUrl),
      runCorsScanner(targetUrl),
      runDirectoryScanner(targetUrl),
      runInfoLeakScanner(targetUrl),
      options.headlessScan ? runPlaywrightScanner(targetUrl) : Promise.resolve([]),
    ]);

    const safeResult = (r, name) => {
      if (r.status === 'rejected') {
        addLog(scanId, `[WARN] ${name || 'Scanner'} skipped: ${r.reason?.message || r.reason}`, 'warn').catch(() => {});
      }
      return r.status === 'fulfilled' ? r.value : [];
    };

    allFindings.push(...safeResult(headerFindings,     'Header scanner'));
    allFindings.push(...safeResult(cookieFindings,     'Cookie scanner'));
    allFindings.push(...safeResult(sslFindings,        'SSL scanner'));
    allFindings.push(...safeResult(robotsFindings,     'Robots scanner'));
    allFindings.push(...safeResult(clickjackFindings,  'Clickjacking scanner'));
    allFindings.push(...safeResult(corsFindings,       'CORS scanner'));
    allFindings.push(...safeResult(dirFindings,        'Directory scanner'));

    const infoLeak = safeResult(infoLeakResult, 'InfoLeak scanner');
    if (infoLeak?.findings) {
      allFindings.push(...infoLeak.findings);
      techStack = infoLeak.techStack || [];
    } else if (Array.isArray(infoLeak)) {
      allFindings.push(...infoLeak);
    }

    allFindings.push(...safeResult(playwrightFindings, 'Playwright scanner'));

    await addLog(scanId, `Scanners complete. Total findings: ${allFindings.length}`);

    // Step 3: Save findings
    const savedFindings = await Finding.insertMany(
      allFindings.map((f) => ({ ...f, scanId }))
    );
    const findingIds = savedFindings.map((f) => f._id);

    // Step 4: Calculate score
    const scoreData = calculateScore(allFindings);

    // Step 5: Update scan record
    const completedAt = new Date();
    const duration = Date.now() - startTime; // use local startTime — scan.startedAt on the stale object is undefined
    await Scan.findByIdAndUpdate(scanId, {
      status: 'completed',
      completedAt,
      duration,
      techStack,
      ...scoreData,
      findings: findingIds,
    });

    await addLog(scanId, `Scan complete! Score: ${scoreData.score}/100 (${scoreData.grade})`, 'info', scoreData);
    logger.info(`Scan ${scanId} completed. Score: ${scoreData.score}`);

    return { success: true, scoreData };
  } catch (err) {
    logger.error(`Scan pipeline error for ${scanId}:`, err.message);
    await Scan.findByIdAndUpdate(scanId, { status: 'failed', errorMessage: err.message, completedAt: new Date() });
    await addLog(scanId, `Scan failed: ${err.message}`, 'error');
    throw err;
  }
};
