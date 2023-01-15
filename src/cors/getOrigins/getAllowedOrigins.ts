import type { Cors } from '../../utils/types';

export const getAllowedOrigins = async (origin: Cors['origin']): Promise<(string | RegExp)[]> => {
  if (Array.isArray(origin)) {
    return origin;
  }

  if (typeof origin === 'string' || origin instanceof RegExp) {
    return [origin];
  }

  if (typeof origin === 'function') {
    return getAllowedOrigins(await origin());
  }

  throw new Error('Invalid cors origin format');
};
