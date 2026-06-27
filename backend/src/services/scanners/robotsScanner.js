/**
 * Robots.txt & Security.txt Scanner
 */
import { httpGet } from '../../utils/httpClient.js';

const SENSITIVE_DISALLOW_PATTERNS = [
  '/admin', '/backup', '/config', '/.git', '/private',
  '/secret', '/credentials', '/passwd', '/database',
  '/wp-admin', '/phpmyadmin', '/cpanel',
];

export const runRobotsScanner = async (targetUrl) => {
  const findings = [];
  const base = new URL(targetUrl).origin;

  // --- robots.txt ---
  const robotsResult = await httpGet(`${base}/robots.txt`);
  if (!robotsResult.ok || robotsResult.status !== 200) {
    findings.push({
      title: 'robots.txt Not Found',
      description: 'No robots.txt file was found. While not a direct vulnerability, it is a good practice to have one.',
      severity: 'informational',
      cwe: 'CWE-200',
      owasp: 'A01:2021',
      affectedUrl: `${base}/robots.txt`,
      evidence: `HTTP ${robotsResult.status || 'Error'}`,
      remediation: 'Create a robots.txt file to control crawler access to your site.',
      references: ['https://developer.mozilla.org/en-US/docs/Glossary/Robots.txt'],
      category: 'discovery',
    });
  } else {
    const robotsContent = robotsResult.data;
    const lines = String(robotsContent).split('\n');
    const disallowLines = lines
      .filter((l) => l.toLowerCase().startsWith('disallow:'))
      .map((l) => l.split(':')[1]?.trim());

    // Check if sensitive paths are exposed in Disallow (tells attackers what exists)
    const exposedPaths = disallowLines.filter((path) =>
      SENSITIVE_DISALLOW_PATTERNS.some((p) => path && path.toLowerCase().includes(p))
    );

    if (exposedPaths.length > 0) {
      findings.push({
        title: 'Sensitive Paths Disclosed in robots.txt',
        description:
          'The robots.txt file contains Disallow directives for sensitive paths. This inadvertently reveals the existence of these paths to attackers.',
        severity: 'low',
        cwe: 'CWE-200',
        owasp: 'A01:2021',
        affectedUrl: `${base}/robots.txt`,
        evidence: `Sensitive paths: ${exposedPaths.join(', ')}`,
        remediation:
          'Do not list sensitive or confidential paths in robots.txt. Rely on proper access controls instead.',
        references: ['https://owasp.org/www-project-web-security-testing-guide/'],
        category: 'discovery',
      });
    }
  }

  // --- security.txt ---
  const securityTxtPaths = [`${base}/.well-known/security.txt`, `${base}/security.txt`];
  let foundSecurityTxt = false;
  for (const path of securityTxtPaths) {
    const res = await httpGet(path);
    if (res.ok && res.status === 200 && String(res.data).includes('Contact:')) {
      foundSecurityTxt = true;
      break;
    }
  }

  if (!foundSecurityTxt) {
    findings.push({
      title: 'security.txt Not Found',
      description:
        'No security.txt file was found. This file helps security researchers report vulnerabilities responsibly.',
      severity: 'informational',
      cwe: 'CWE-200',
      owasp: 'A05:2021',
      affectedUrl: `${base}/.well-known/security.txt`,
      evidence: 'Neither /.well-known/security.txt nor /security.txt returned a valid response',
      remediation: 'Create a security.txt file per RFC 9116 at /.well-known/security.txt',
      references: ['https://securitytxt.org/', 'https://www.rfc-editor.org/rfc/rfc9116'],
      category: 'discovery',
    });
  }

  return findings;
};
