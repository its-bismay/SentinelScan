/**
 * HTTP Security Header Scanner
 * Checks for missing or misconfigured security headers
 */
import { httpGet } from '../../utils/httpClient.js';

const REQUIRED_HEADERS = [
  {
    name: 'content-security-policy',
    title: 'Missing Content-Security-Policy Header',
    description:
      'Content-Security-Policy (CSP) header is missing. CSP helps prevent Cross-Site Scripting (XSS) and data injection attacks by specifying which sources of content are allowed to be loaded.',
    severity: 'high',
    cwe: 'CWE-693',
    owasp: 'A05:2021',
    remediation:
      "Add a Content-Security-Policy header. Start with: `Content-Security-Policy: default-src 'self'` and progressively expand as needed.",
    references: [
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
      'https://owasp.org/www-project-secure-headers/',
    ],
  },
  {
    name: 'strict-transport-security',
    title: 'Missing Strict-Transport-Security (HSTS) Header',
    description:
      'HTTP Strict Transport Security (HSTS) header is missing. Without HSTS, browsers may connect over HTTP, exposing users to downgrade and man-in-the-middle attacks.',
    severity: 'high',
    cwe: 'CWE-319',
    owasp: 'A02:2021',
    remediation:
      'Add: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`',
    references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security'],
  },
  {
    name: 'x-frame-options',
    title: 'Missing X-Frame-Options Header',
    description:
      'X-Frame-Options header is missing, which may allow the page to be embedded in iframes on malicious sites, enabling clickjacking attacks.',
    severity: 'medium',
    cwe: 'CWE-1021',
    owasp: 'A05:2021',
    remediation: "Add: `X-Frame-Options: SAMEORIGIN` or use CSP frame-ancestors directive.",
    references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options'],
  },
  {
    name: 'x-content-type-options',
    title: 'Missing X-Content-Type-Options Header',
    description:
      'X-Content-Type-Options header is missing. Without this header, browsers may MIME-sniff responses, potentially executing malicious content.',
    severity: 'low',
    cwe: 'CWE-693',
    owasp: 'A05:2021',
    remediation: 'Add: `X-Content-Type-Options: nosniff`',
    references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options'],
  },
  {
    name: 'referrer-policy',
    title: 'Missing Referrer-Policy Header',
    description:
      'Referrer-Policy header is missing. Without this, sensitive URL information may leak to third-party sites via the Referer header.',
    severity: 'low',
    cwe: 'CWE-200',
    owasp: 'A01:2021',
    remediation: 'Add: `Referrer-Policy: strict-origin-when-cross-origin`',
    references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy'],
  },
  {
    name: 'permissions-policy',
    title: 'Missing Permissions-Policy Header',
    description:
      'Permissions-Policy (formerly Feature-Policy) header is missing. This header controls which browser features and APIs can be used.',
    severity: 'informational',
    cwe: 'CWE-693',
    owasp: 'A05:2021',
    remediation:
      'Add: `Permissions-Policy: geolocation=(), microphone=(), camera=()`',
    references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy'],
  },
];

const CSP_WEAKNESSES = [
  { pattern: /unsafe-inline/i, title: 'Weak CSP: unsafe-inline Allowed', severity: 'high' },
  { pattern: /unsafe-eval/i, title: 'Weak CSP: unsafe-eval Allowed', severity: 'high' },
  { pattern: /\*/,             title: 'Weak CSP: Wildcard (*) Source Allowed', severity: 'medium' },
];

export const runHeaderScanner = async (targetUrl) => {
  const findings = [];
  const result = await httpGet(targetUrl);

  if (!result.ok) {
    return findings;
  }

  const headers = result.headers;

  for (const spec of REQUIRED_HEADERS) {
    if (!headers[spec.name]) {
      findings.push({
        ...spec,
        affectedUrl: targetUrl,
        evidence: `Header "${spec.name}" not present in response`,
        category: 'headers',
      });
    }
  }

  // Check CSP weaknesses
  const csp = headers['content-security-policy'];
  if (csp) {
    for (const weakness of CSP_WEAKNESSES) {
      if (weakness.pattern.test(csp)) {
        findings.push({
          title: weakness.title,
          description: `The Content-Security-Policy header contains an insecure directive: "${weakness.pattern.source}"`,
          severity: weakness.severity,
          cwe: 'CWE-693',
          owasp: 'A05:2021',
          affectedUrl: targetUrl,
          evidence: `Content-Security-Policy: ${csp}`,
          remediation: 'Remove unsafe directives from CSP. Use nonces or hashes instead of unsafe-inline/unsafe-eval.',
          references: ['https://content-security-policy.com/'],
          category: 'headers',
        });
      }
    }
  }

  return findings;
};
