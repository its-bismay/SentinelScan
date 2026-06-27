/**
 * Cookie Security Scanner
 * Checks for missing Secure, HttpOnly, SameSite flags on cookies
 */
import { httpGet } from '../../utils/httpClient.js';

const parseCookies = (setCookieHeaders) => {
  if (!setCookieHeaders) return [];
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  return headers.map((raw) => {
    const parts = raw.split(';').map((p) => p.trim());
    const [nameValue, ...attributes] = parts;
    const [name] = nameValue.split('=');
    const attrs = attributes.map((a) => a.toLowerCase());
    return {
      name: name.trim(),
      raw,
      secure: attrs.some((a) => a === 'secure'),
      httpOnly: attrs.some((a) => a === 'httponly'),
      sameSite: attrs.find((a) => a.startsWith('samesite'))?.split('=')[1] || null,
    };
  });
};

export const runCookieScanner = async (targetUrl) => {
  const findings = [];
  const result = await httpGet(targetUrl);

  if (!result.ok) return findings;

  const raw = result.headers['set-cookie'];
  const cookies = parseCookies(raw);

  if (cookies.length === 0) return findings;

  for (const cookie of cookies) {
    if (!cookie.secure) {
      findings.push({
        title: `Cookie "${cookie.name}" Missing Secure Flag`,
        description: `The cookie "${cookie.name}" is set without the Secure flag. This allows it to be transmitted over unencrypted HTTP connections.`,
        severity: 'medium',
        cwe: 'CWE-614',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: cookie.raw,
        remediation: `Add the Secure attribute to the "${cookie.name}" cookie: Set-Cookie: ${cookie.name}=...; Secure`,
        references: ['https://owasp.org/www-community/controls/SecureCookieAttribute'],
        category: 'cookies',
      });
    }

    if (!cookie.httpOnly) {
      findings.push({
        title: `Cookie "${cookie.name}" Missing HttpOnly Flag`,
        description: `The cookie "${cookie.name}" is set without the HttpOnly flag. This exposes the cookie to JavaScript, increasing the risk of theft via XSS attacks.`,
        severity: 'medium',
        cwe: 'CWE-1004',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: cookie.raw,
        remediation: `Add the HttpOnly attribute to the "${cookie.name}" cookie: Set-Cookie: ${cookie.name}=...; HttpOnly`,
        references: ['https://owasp.org/www-community/HttpOnly'],
        category: 'cookies',
      });
    }

    if (!cookie.sameSite) {
      findings.push({
        title: `Cookie "${cookie.name}" Missing SameSite Attribute`,
        description: `The cookie "${cookie.name}" has no SameSite attribute. This may allow cross-site request forgery (CSRF) attacks.`,
        severity: 'low',
        cwe: 'CWE-352',
        owasp: 'A01:2021',
        affectedUrl: targetUrl,
        evidence: cookie.raw,
        remediation: `Add SameSite=Strict or SameSite=Lax to the "${cookie.name}" cookie.`,
        references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite'],
        category: 'cookies',
      });
    }

    if (cookie.sameSite === 'none' && !cookie.secure) {
      findings.push({
        title: `Cookie "${cookie.name}" Has SameSite=None Without Secure`,
        description: `SameSite=None requires the Secure flag to be valid in modern browsers. Without it, the SameSite=None attribute is ignored.`,
        severity: 'medium',
        cwe: 'CWE-614',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: cookie.raw,
        remediation: `Add the Secure flag when using SameSite=None.`,
        references: ['https://web.dev/samesite-cookies-explained/'],
        category: 'cookies',
      });
    }
  }

  return findings;
};
