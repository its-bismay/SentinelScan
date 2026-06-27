import axios from 'axios';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_HEADERS = {
  'User-Agent':
    'SentinelScan/1.0 Security Scanner (https://github.com/sentinelscan)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

export const createHttpClient = (options = {}) => {
  return axios.create({
    timeout: options.timeout || DEFAULT_TIMEOUT,
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    validateStatus: () => true, // Don't throw on any status code
    maxRedirects: options.maxRedirects ?? 5,
    httpsAgent: options.httpsAgent,
  });
};

export const httpGet = async (url, options = {}) => {
  const client = createHttpClient(options);
  try {
    const response = await client.get(url);
    return {
      ok: true,
      status: response.status,
      headers: response.headers,
      data: response.data,
      url: response.request?.res?.responseUrl || url,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      status: null,
      headers: {},
      data: null,
    };
  }
};

export const httpHead = async (url, options = {}) => {
  const client = createHttpClient(options);
  try {
    const response = await client.head(url);
    return {
      ok: true,
      status: response.status,
      headers: response.headers,
      url: response.request?.res?.responseUrl || url,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      status: null,
      headers: {},
    };
  }
};
