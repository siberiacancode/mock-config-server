import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';

import { interceptorsSchema } from '../../interceptorsSchema/interceptorsSchema';
import { queueSchema } from '../../queueSchema/queueSchema';
import { settingsSchema } from '../../settingsSchema/settingsSchema';
import { mappedEntitySchema, nonRegExpSchema, plainEntitySchema } from '../../utils';

const baseRouteConfigSchema = z.strictObject({
  entities: nonRegExpSchema(
    z.strictObject({
      headers: mappedEntitySchema.optional(),
      cookies: mappedEntitySchema.optional(),
      query: mappedEntitySchema.optional(),
      variables: plainEntitySchema.optional()
    })
  ).optional(),
  interceptors: nonRegExpSchema(interceptorsSchema.pick({ response: true })).optional()
});

const dataRouteConfigSchema = z
  .strictObject({
    settings: settingsSchema.extend({ polling: z.literal(false) }).optional(),
    data: z.union([z.function(), z.any()])
  })
  .merge(baseRouteConfigSchema);

const queueRouteConfigSchema = z
  .strictObject({
    settings: settingsSchema.extend({ polling: z.literal(true) }),
    queue: queueSchema
  })
  .merge(baseRouteConfigSchema);

export const routeConfigSchema = z.union([
  z
    .custom((value) => isPlainObject(value) && 'data' in value && !('queue' in value))
    .pipe(dataRouteConfigSchema),
  z
    .custom((value) => isPlainObject(value) && 'queue' in value && !('data' in value))
    .pipe(queueRouteConfigSchema)
]);
