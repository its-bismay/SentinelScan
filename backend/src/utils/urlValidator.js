export const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'URL must use http or https protocol' };
    }
    if (!parsed.hostname || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return { valid: false, reason: 'Scanning localhost is not allowed' };
    }
    // Block private IP ranges
    const privateRanges = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./];
    if (privateRanges.some((r) => r.test(parsed.hostname))) {
      return { valid: false, reason: 'Scanning private IP ranges is not allowed' };
    }
    return { valid: true, url: parsed.href, hostname: parsed.hostname };
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
};

export const normalizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
};
