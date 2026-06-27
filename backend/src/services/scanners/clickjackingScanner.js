/**
 * Clickjacking Detection Scanner
 */
import { httpGet } from '../../utils/httpClient.js';

export const runClickjackingScanner = async (targetUrl) => {
  const findings = [];
  const result = await httpGet(targetUrl);
  if (!result.ok) return findings;

  const headers = result.headers;
  const xfo = headers['x-frame-options'];
  const csp = headers['content-security-policy'];

  const hasXfo = xfo && ['DENY', 'SAMEORIGIN'].includes(xfo.toUpperCase().trim());
  const hasCspFrameAncestors =
    csp && /frame-ancestors\s+(?!'none'|\*)/i.test(csp) && !/frame-ancestors\s+\*/i.test(csp);

  if (!hasXfo && !hasCspFrameAncestors) {
    findings.push({
      title: 'Clickjacking Protection Not Implemented',
      description:
        'The page lacks both X-Frame-Options and a restrictive CSP frame-ancestors directive. This makes the page vulnerable to clickjacking attacks where an attacker can embed the page in an invisible iframe to trick users into clicking on hidden UI elements.',
      severity: 'medium',
      cwe: 'CWE-1021',
      owasp: 'A05:2021',
      affectedUrl: targetUrl,
      evidence: `X-Frame-Options: ${xfo || 'absent'} | CSP frame-ancestors: ${
        csp ? (csp.match(/frame-ancestors[^;]*/)?.[0] || 'not set') : 'absent'
      }`,
      remediation:
        "Add `X-Frame-Options: SAMEORIGIN` or use the CSP directive `frame-ancestors 'self'` to prevent framing by untrusted origins.",
      references: [
        'https://owasp.org/www-community/attacks/Clickjacking',
        'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
      ],
      category: 'clickjacking',
    });
  }

  return findings;
};
