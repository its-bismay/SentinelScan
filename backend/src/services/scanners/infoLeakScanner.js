/**
 * Information Leakage Scanner
 * Detects server banner, X-Powered-By, framework version disclosure
 */
import { httpGet } from '../../utils/httpClient.js';

const TECH_PATTERNS = [
  { header: 'x-powered-by', pattern: /./i, title: 'Technology Disclosure via X-Powered-By' },
  { header: 'server', pattern: /\d+\.\d+/i, title: 'Server Version Disclosure' },
  { header: 'x-aspnet-version', pattern: /./i, title: 'ASP.NET Version Disclosed' },
  { header: 'x-aspnetmvc-version', pattern: /./i, title: 'ASP.NET MVC Version Disclosed' },
  { header: 'x-generator', pattern: /./i, title: 'Generator Header Disclosure' },
];

export const runInfoLeakScanner = async (targetUrl) => {
  const findings = [];
  const result = await httpGet(targetUrl);
  if (!result.ok) return findings;

  const headers = result.headers;

  for (const spec of TECH_PATTERNS) {
    const val = headers[spec.header];
    if (val && spec.pattern.test(val)) {
      findings.push({
        title: spec.title,
        description: `The response header "${spec.header}" reveals technology or version information: "${val}". Attackers can use this to identify known vulnerabilities in specific versions.`,
        severity: 'low',
        cwe: 'CWE-200',
        owasp: 'A05:2021',
        affectedUrl: targetUrl,
        evidence: `${spec.header}: ${val}`,
        remediation: `Remove or obscure the "${spec.header}" header from server responses.`,
        references: ['https://owasp.org/www-project-web-security-testing-guide/'],
        category: 'info-leak',
      });
    }
  }

  // Check for stack traces in body
  const body = String(result.data || '');
  const stackPatterns = [
    { pattern: /at\s+\w+\s*\(.*\.js:\d+:\d+\)/i, label: 'JavaScript stack trace' },
    { pattern: /Traceback \(most recent call last\)/i, label: 'Python traceback' },
    { pattern: /java\.lang\.\w+Exception/i, label: 'Java exception' },
    { pattern: /System\.Web\.HttpException/i, label: '.NET exception' },
    { pattern: /Fatal error:/i, label: 'PHP fatal error' },
  ];
  for (const sp of stackPatterns) {
    if (sp.pattern.test(body)) {
      findings.push({
        title: `Stack Trace Exposed in Response (${sp.label})`,
        description: `The response body contains a ${sp.label}. Stack traces reveal internal file paths, framework versions, and code structure.`,
        severity: 'medium',
        cwe: 'CWE-209',
        owasp: 'A05:2021',
        affectedUrl: targetUrl,
        evidence: body.match(sp.pattern)?.[0]?.substring(0, 200) || 'Stack trace detected',
        remediation: 'Disable detailed error messages in production. Log errors server-side and show generic messages to users.',
        references: ['https://owasp.org/www-community/Improper_Error_Handling'],
        category: 'info-leak',
      });
      break;
    }
  }

  // Fingerprint tech stack from body
  const techFingerprints = [
    { pattern: /wp-content|wp-includes/i, tech: 'WordPress' },
    { pattern: /Powered by Drupal/i, tech: 'Drupal' },
    { pattern: /Joomla!/i, tech: 'Joomla' },
    { pattern: /laravel_session/i, tech: 'Laravel' },
    { pattern: /__next\/static/i, tech: 'Next.js' },
    { pattern: /react-dom/i, tech: 'React' },
    { pattern: /angular\.min\.js/i, tech: 'AngularJS' },
  ];

  const detectedTech = techFingerprints
    .filter((f) => f.pattern.test(body))
    .map((f) => f.tech);

  if (detectedTech.length > 0) {
    findings.push({
      title: `Technology Fingerprinting: ${detectedTech.join(', ')} Detected`,
      description: `The page reveals the use of ${detectedTech.join(', ')} through HTML source patterns. This allows attackers to target known CVEs for those frameworks.`,
      severity: 'informational',
      cwe: 'CWE-200',
      owasp: 'A05:2021',
      affectedUrl: targetUrl,
      evidence: `Detected technologies: ${detectedTech.join(', ')}`,
      remediation: 'Consider minimizing technology fingerprinting by removing version comments and obfuscating framework-specific patterns.',
      references: ['https://owasp.org/www-project-web-security-testing-guide/'],
      category: 'info-leak',
    });
  }

  return { findings, techStack: detectedTech };
};
