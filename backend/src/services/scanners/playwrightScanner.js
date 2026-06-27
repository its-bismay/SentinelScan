/**
 * Playwright Headless Browser Scanner
 * Discovers JS-rendered content, console errors, and additional endpoints
 */
import logger from '../../utils/logger.js';

export const runPlaywrightScanner = async (targetUrl) => {
  const findings = [];
  let browser = null;

  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'SentinelScan/1.0 Headless Security Scanner',
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    const mixedContentUrls = [];
    const networkRequests = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('request', (req) => {
      const url = req.url();
      const isHttp = url.startsWith('http://');
      if (isHttp && targetUrl.startsWith('https://')) mixedContentUrls.push(url);
      networkRequests.push(url);
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Check for mixed content
    if (mixedContentUrls.length > 0) {
      findings.push({
        title: 'Mixed Content Detected',
        description: `The HTTPS page loads ${mixedContentUrls.length} resource(s) over HTTP, exposing them to interception.`,
        severity: 'medium',
        cwe: 'CWE-319',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: `Mixed content URLs: ${mixedContentUrls.slice(0, 5).join(', ')}`,
        remediation: 'Ensure all resources (scripts, styles, images) are loaded over HTTPS.',
        references: ['https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content'],
        category: 'headless',
      });
    }

    // Check for JS console errors (may indicate broken auth/API calls)
    if (consoleErrors.length > 0) {
      findings.push({
        title: 'JavaScript Console Errors Detected',
        description: `${consoleErrors.length} JavaScript error(s) were found in the browser console, indicating broken functionality or security misconfigurations.`,
        severity: 'informational',
        cwe: 'CWE-388',
        owasp: 'A05:2021',
        affectedUrl: targetUrl,
        evidence: consoleErrors.slice(0, 3).join('\n'),
        remediation: 'Investigate and fix JavaScript errors. Errors can mask security-relevant failures.',
        references: [],
        category: 'headless',
      });
    }

    // Check localStorage/sessionStorage for sensitive data
    const storageData = await page.evaluate(() => {
      const ls = { ...localStorage };
      const ss = { ...sessionStorage };
      return { localStorage: ls, sessionStorage: ss };
    });

    const sensitiveKeys = ['token', 'password', 'secret', 'apikey', 'api_key', 'auth'];
    const sensitiveLS = Object.keys(storageData.localStorage).filter((k) =>
      sensitiveKeys.some((s) => k.toLowerCase().includes(s))
    );
    const sensitiveSS = Object.keys(storageData.sessionStorage).filter((k) =>
      sensitiveKeys.some((s) => k.toLowerCase().includes(s))
    );

    if (sensitiveLS.length > 0 || sensitiveSS.length > 0) {
      findings.push({
        title: 'Sensitive Data Stored in Browser Storage',
        description: `Potentially sensitive keys found in localStorage/sessionStorage: ${[...sensitiveLS, ...sensitiveSS].join(', ')}. Browser storage is accessible to any JavaScript on the page.`,
        severity: 'high',
        cwe: 'CWE-312',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: `localStorage keys: [${sensitiveLS.join(', ')}] | sessionStorage keys: [${sensitiveSS.join(', ')}]`,
        remediation: 'Do not store tokens, passwords, or sensitive data in localStorage/sessionStorage. Use HttpOnly cookies instead.',
        references: ['https://owasp.org/www-community/vulnerabilities/Insufficient_Session-ID_Length'],
        category: 'headless',
      });
    }

    await context.close();
  } catch (err) {
    logger.warn('Playwright scanner error (non-fatal):', err.message);
    if (!err.message.includes('browserType')) {
      findings.push({
        title: 'Headless Scan Incomplete',
        description: `Headless browser scan encountered an error: ${err.message}`,
        severity: 'informational',
        cwe: '',
        owasp: '',
        affectedUrl: targetUrl,
        evidence: err.message,
        remediation: 'This is a scanner-side issue, not a vulnerability in the target.',
        references: [],
        category: 'headless',
      });
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return findings;
};
