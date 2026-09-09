import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';

import { rawRouteConfigSchema } from '../rawRouteConfigSchema/rawRouteConfigSchema';

export const routeConfigSchema = z
  .custom((value) => isPlainObject(value) && 'data' in value)
  .pipe(rawRouteConfigSchema);
