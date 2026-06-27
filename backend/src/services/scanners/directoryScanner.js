/**
 * Exposed Directory Scanner
 */
import { httpHead } from '../../utils/httpClient.js';

const WORDLIST = [
  '/admin', '/admin/', '/administrator', '/backup', '/backup.zip', '/backup.tar.gz',
  '/.git', '/.git/HEAD', '/.env', '/.env.local', '/.env.production',
  '/config', '/config.php', '/config.yml', '/config.json',
  '/swagger', '/swagger-ui', '/swagger-ui.html', '/api-docs', '/graphql',
  '/wp-admin', '/wp-login.php', '/phpmyadmin', '/phpinfo.php',
  '/server-status', '/server-info', '/.htaccess', '/web.config',
  '/debug', '/trace', '/actuator', '/actuator/health', '/actuator/env',
  '/console', '/jmx-console', '/management', '/metrics',
  '/uploads', '/files', '/static', '/assets', '/logs', '/log',
  '/dump', '/db', '/database', '/data', '/api/v1', '/api/v2',
];

const INTERESTING_STATUS = [200, 201, 301, 302, 401, 403];

export const runDirectoryScanner = async (targetUrl) => {
  const findings = [];
  const base = new URL(targetUrl).origin;

  const checks = await Promise.allSettled(
    WORDLIST.map(async (path) => {
      const url = `${base}${path}`;
      const result = await httpHead(url, { maxRedirects: 0, timeout: 6000 });
      if (result.ok && INTERESTING_STATUS.includes(result.status)) {
        return { url, status: result.status, path };
      }
      return null;
    })
  );

  const found = checks
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);

  for (const item of found) {
    const is403or401 = item.status === 401 || item.status === 403;
    findings.push({
      title: is403or401
        ? `Restricted Path Exists: ${item.path}`
        : `Exposed Sensitive Path: ${item.path}`,
      description: is403or401
        ? `The path ${item.path} exists on the server but returns a ${item.status} (access denied), confirming its presence.`
        : `The path ${item.path} is accessible and returned HTTP ${item.status}. This may expose sensitive functionality or data.`,
      severity: item.status === 200 && ['/admin', '/.git', '/.env', '/phpmyadmin'].some(p => item.path.startsWith(p))
        ? 'critical'
        : item.status === 200 ? 'high' : 'medium',
      cwe: 'CWE-548',
      owasp: 'A01:2021',
      affectedUrl: item.url,
      evidence: `HTTP ${item.status} on ${item.url}`,
      remediation: `Restrict access to ${item.path}. If not in use, remove it entirely. Ensure proper authentication is enforced.`,
      references: ['https://owasp.org/www-project-web-security-testing-guide/'],
      category: 'directory',
    });
  }

  return findings;
};
