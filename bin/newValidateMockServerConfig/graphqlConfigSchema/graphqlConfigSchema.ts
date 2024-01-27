import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';

import { baseUrlSchema } from '../baseUrlSchema/baseUrlSchema';
import { interceptorsSchema } from '../interceptorsSchema/interceptorsSchema';
import { nonRegExpSchema } from '../utils';

import { routeConfigSchema } from './routesSchema/routesSchema';

const baseRequestConfigSchema = z.strictObject({
  operationType: z.enum(['query', 'mutation']),
  routes: z.array(routeConfigSchema),
  interceptors: nonRegExpSchema(interceptorsSchema).optional()
});

const operationNameRequestConfigSchema = z
  .strictObject({
    operationName: z.union([z.string(), z.instanceof(RegExp)]),
    query: z.string().optional()
  })
  .merge(baseRequestConfigSchema);

const queryRequestConfigSchema = z
  .strictObject({
    operationName: z.union([z.string(), z.instanceof(RegExp)]).optional(),
    query: z.string()
  })
  .merge(baseRequestConfigSchema);

const requestConfigSchema = z.union([
  z
    .custom((value) => isPlainObject(value) && 'operationName' in value)
    .pipe(operationNameRequestConfigSchema),
  z.custom((value) => isPlainObject(value) && 'query' in value).pipe(queryRequestConfigSchema)
]);

export const graphqlConfigSchema = z.strictObject({
  baseUrl: baseUrlSchema.optional(),
  configs: z.array(requestConfigSchema),
  interceptors: nonRegExpSchema(interceptorsSchema).optional()
});
