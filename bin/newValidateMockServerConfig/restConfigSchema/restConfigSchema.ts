import { z } from 'zod';

import type { RestMethod } from '@/utils/types';

import { baseUrlSchema } from '../baseUrlSchema/baseUrlSchema';
import { interceptorsSchema } from '../interceptorsSchema/interceptorsSchema';
import { stringForwardSlashSchema } from '../utils';

import { routeConfigSchema } from './routesSchema/routesSchema';

const baseRequestConfigSchema = (method: RestMethod) =>
  z
    .object({
      path: z.union([stringForwardSlashSchema, z.instanceof(RegExp)]),
      method: z.literal(method),
      routes: z.array(routeConfigSchema(method)),
      interceptors: interceptorsSchema.optional()
    })
    .strict();

const requestConfigSchema = z.union([
  baseRequestConfigSchema('get'),
  baseRequestConfigSchema('post'),
  baseRequestConfigSchema('put'),
  baseRequestConfigSchema('delete'),
  baseRequestConfigSchema('patch'),
  baseRequestConfigSchema('options')
]);

export const restConfigSchema = z
  .object({
    baseUrl: baseUrlSchema.optional(),
    configs: z.array(requestConfigSchema),
    interceptors: interceptorsSchema.optional()
  })
  .strict();
