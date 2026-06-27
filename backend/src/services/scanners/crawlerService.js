/**
 * Web Crawler Service
 * BFS crawl with cheerio — discovers internal URLs, forms, and scripts
 */
import * as cheerio from 'cheerio';
import { httpGet } from '../../utils/httpClient.js';

const normalizeHref = (href, base) => {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return null;
  try {
    const url = new URL(href, base);
    url.hash = '';
    url.search = ''; // ignore query strings for crawl deduplication
    return url.href;
  } catch {
    return null;
  }
};

export const runCrawler = async (targetUrl, options = {}) => {
  const { maxDepth = 3, maxUrls = 50, ignoreRobots = false } = options;
  const origin = new URL(targetUrl).origin;
  const visited = new Set();
  const queue = [{ url: targetUrl, depth: 0 }];
  const discovered = { urls: [], forms: [], scripts: [], images: [] };

  // Respect robots.txt (basic)
  let disallowedPaths = [];
  if (!ignoreRobots) {
    try {
      const robotsRes = await httpGet(`${origin}/robots.txt`);
      if (robotsRes.ok && robotsRes.status === 200) {
        const lines = String(robotsRes.data).split('\n');
        disallowedPaths = lines
          .filter((l) => l.toLowerCase().startsWith('disallow:'))
          .map((l) => l.split(':')[1]?.trim())
          .filter(Boolean);
      }
    } catch { /* ignore */ }
  }

  const isDisallowed = (url) => {
    const pathname = new URL(url).pathname;
    return disallowedPaths.some((p) => p && p !== '/' && pathname.startsWith(p));
  };

  while (queue.length > 0 && visited.size < maxUrls) {
    const { url, depth } = queue.shift();
    if (visited.has(url) || depth > maxDepth) continue;
    if (!url.startsWith(origin)) continue;
    if (isDisallowed(url)) continue;

    visited.add(url);
    discovered.urls.push(url);

    const result = await httpGet(url, { timeout: 8000 });
    if (!result.ok || !result.data) continue;

    const contentType = result.headers['content-type'] || '';
    if (!contentType.includes('text/html')) continue;

    const $ = cheerio.load(result.data);

    // Collect links
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const normalized = normalizeHref(href, url);
      if (normalized && normalized.startsWith(origin) && !visited.has(normalized)) {
        queue.push({ url: normalized, depth: depth + 1 });
      }
    });

    // Collect forms
    $('form').each((_, el) => {
      const action = $(el).attr('action') || url;
      const method = ($(el).attr('method') || 'GET').toUpperCase();
      const inputs = [];
      $(el).find('input, textarea, select').each((_, inp) => {
        inputs.push({ name: $(inp).attr('name'), type: $(inp).attr('type') || 'text' });
      });
      discovered.forms.push({ url, action: normalizeHref(action, url) || action, method, inputs });
    });

    // Collect scripts
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) discovered.scripts.push(normalizeHref(src, url) || src);
    });

    // Collect images
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) discovered.images.push(normalizeHref(src, url) || src);
    });
  }

  return discovered;
};
