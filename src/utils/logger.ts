import { Log } from 'apify';

/**
 * Shared logger instance.
 * Uses Apify Log internally so logs appear correctly in Actor runs.
 */
export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    Log.info(message, data);
  },

  warning(message: string, data?: Record<string, unknown>) {
    Log.warning(message, data);
  },

  error(message: string, data?: Record<string, unknown>) {
    Log.error(message, data);
  },

  debug(message: string, data?: Record<string, unknown>) {
    Log.debug(message, data);
  },
};
