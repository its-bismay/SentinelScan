/**
 * CORS Misconfiguration Scanner
 */
import { httpGet } from '../../utils/httpClient.js';

export const runCorsScanner = async (targetUrl) => {
  const findings = [];
  const attackerOrigin = 'https://evil-attacker.com';
  const result = await httpGet(targetUrl, { headers: { Origin: attackerOrigin } });
  if (!result.ok) return findings;

  const acao = result.headers['access-control-allow-origin'];
  const acac = result.headers['access-control-allow-credentials'];

  if (acao === '*') {
    findings.push({
      title: 'CORS: Wildcard Origin Allowed',
      description: 'The server responds with Access-Control-Allow-Origin: *, allowing any website to make cross-origin requests.',
      severity: 'low', cwe: 'CWE-942', owasp: 'A05:2021',
      affectedUrl: targetUrl,
      evidence: `Access-Control-Allow-Origin: *`,
      remediation: 'Restrict CORS to specific trusted origins. Avoid using * if the API handles authenticated sessions.',
      references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'],
      category: 'cors',
    });
  } else if (acao === attackerOrigin) {
    const withCredentials = acac?.toLowerCase() === 'true';
    findings.push({
      title: `CORS: Origin Reflection${withCredentials ? ' with Credentials' : ''}`,
      description: withCredentials
        ? 'The server reflects attacker-controlled Origin AND allows credentials. Critical CORS misconfiguration.'
        : 'The server blindly reflects the Origin header, allowing any origin to make cross-origin requests.',
      severity: withCredentials ? 'critical' : 'high', cwe: 'CWE-942', owasp: 'A05:2021',
      affectedUrl: targetUrl,
      evidence: `Access-Control-Allow-Origin: ${acao}\nAccess-Control-Allow-Credentials: ${acac || 'absent'}`,
      remediation: 'Implement a strict allowlist of origins. Never combine reflected origin with Allow-Credentials: true.',
      references: ['https://portswigger.net/web-security/cors'],
      category: 'cors',
    });
  }
  return findings;
};
