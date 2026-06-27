/**
 * SSL/TLS & HTTPS Scanner
 * Checks HTTPS enforcement, redirect behaviour, certificate validity
 */
import { httpGet } from '../../utils/httpClient.js';
import https from 'https';
import tls from 'tls';

const checkCertificate = (hostname) => {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(443, hostname, { servername: hostname, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();
        if (!cert || Object.keys(cert).length === 0) {
          return resolve({ valid: false, error: 'No certificate found' });
        }
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
        resolve({
          valid: true,
          subject: cert.subject?.CN || hostname,
          issuer: cert.issuer?.O || 'Unknown',
          validTo: cert.valid_to,
          daysRemaining,
          expired: daysRemaining <= 0,
          expiringSoon: daysRemaining > 0 && daysRemaining <= 30,
          selfSigned: cert.issuer?.O === cert.subject?.O,
        });
      });
      socket.on('error', (err) => resolve({ valid: false, error: err.message }));
      socket.setTimeout(8000, () => {
        socket.destroy();
        resolve({ valid: false, error: 'Connection timeout' });
      });
    } catch (err) {
      resolve({ valid: false, error: err.message });
    }
  });
};

export const runSslScanner = async (targetUrl) => {
  const findings = [];
  const parsed = new URL(targetUrl);
  const hostname = parsed.hostname;

  // Check if HTTP redirects to HTTPS
  if (parsed.protocol === 'https:') {
    const httpVersion = `http://${parsed.host}${parsed.pathname}`;
    const httpResult = await httpGet(httpVersion, { maxRedirects: 0 });
    const redirectLocation = httpResult.headers?.location || '';
    const redirectsToHttps =
      httpResult.status === 301 ||
      httpResult.status === 302 ||
      redirectLocation.startsWith('https://');

    if (!redirectsToHttps) {
      findings.push({
        title: 'HTTP to HTTPS Redirect Not Enforced',
        description:
          'The site is accessible over HTTP without being redirected to HTTPS. Users connecting over HTTP are vulnerable to eavesdropping and MITM attacks.',
        severity: 'high',
        cwe: 'CWE-319',
        owasp: 'A02:2021',
        affectedUrl: httpVersion,
        evidence: `HTTP ${httpResult.status} — no redirect to HTTPS`,
        remediation: 'Configure your server to redirect all HTTP traffic to HTTPS (301 redirect).',
        references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security'],
        category: 'ssl',
      });
    }
  } else {
    findings.push({
      title: 'Site Not Using HTTPS',
      description: 'The target URL uses HTTP instead of HTTPS, transmitting all data in plaintext.',
      severity: 'critical',
      cwe: 'CWE-319',
      owasp: 'A02:2021',
      affectedUrl: targetUrl,
      evidence: `Protocol: ${parsed.protocol}`,
      remediation: 'Obtain an SSL/TLS certificate and configure HTTPS on your server.',
      references: ['https://letsencrypt.org/'],
      category: 'ssl',
    });
    return findings;
  }

  // Certificate check
  const cert = await checkCertificate(hostname);
  if (!cert.valid) {
    findings.push({
      title: 'SSL Certificate Error',
      description: `Could not retrieve or validate the SSL certificate for ${hostname}.`,
      severity: 'high',
      cwe: 'CWE-295',
      owasp: 'A02:2021',
      affectedUrl: targetUrl,
      evidence: cert.error,
      remediation: 'Ensure a valid SSL/TLS certificate is installed and properly configured.',
      references: ['https://letsencrypt.org/'],
      category: 'ssl',
    });
  } else {
    if (cert.expired) {
      findings.push({
        title: 'SSL Certificate Expired',
        description: `The SSL certificate for ${hostname} expired on ${cert.validTo}.`,
        severity: 'critical',
        cwe: 'CWE-298',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: `Valid To: ${cert.validTo} — Expired ${Math.abs(cert.daysRemaining)} days ago`,
        remediation: 'Renew the SSL certificate immediately.',
        references: ['https://letsencrypt.org/'],
        category: 'ssl',
      });
    } else if (cert.expiringSoon) {
      findings.push({
        title: 'SSL Certificate Expiring Soon',
        description: `The SSL certificate for ${hostname} expires in ${cert.daysRemaining} days.`,
        severity: 'medium',
        cwe: 'CWE-298',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: `Valid To: ${cert.validTo} — ${cert.daysRemaining} days remaining`,
        remediation: 'Renew the SSL certificate before expiry.',
        references: ['https://letsencrypt.org/'],
        category: 'ssl',
      });
    }
    if (cert.selfSigned) {
      findings.push({
        title: 'Self-Signed SSL Certificate Detected',
        description: 'The SSL certificate is self-signed and will not be trusted by browsers by default.',
        severity: 'high',
        cwe: 'CWE-295',
        owasp: 'A02:2021',
        affectedUrl: targetUrl,
        evidence: `Issuer: ${cert.issuer} — Subject: ${cert.subject}`,
        remediation: 'Replace the self-signed certificate with one from a trusted Certificate Authority (e.g. Let\'s Encrypt).',
        references: ['https://letsencrypt.org/'],
        category: 'ssl',
      });
    }
  }

  return findings;
};
