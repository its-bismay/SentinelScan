const logger = {
  info: (msg, data = '') => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data),
  warn: (msg, data = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data),
  error: (msg, data = '') => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, data),
  debug: (msg, data = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, data);
    }
  },
};

export default logger;
