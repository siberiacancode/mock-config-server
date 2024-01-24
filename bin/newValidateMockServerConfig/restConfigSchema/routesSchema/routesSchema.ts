import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';
import type { RestMethod } from '@/utils/types';

import { interceptorsSchema } from '../../interceptorsSchema/interceptorsSchema';
import { queueSchema } from '../../queueSchema/queueSchema';
import { settingsSchema } from '../../settingsSchema/settingsSchema';
import { mappedEntitySchema, nonRegExpSchema, plainEntitySchema } from '../../utils';

const METHODS_WITH_BODY = ['post', 'put', 'patch'];
const entitiesByEntityNameSchema = (method: RestMethod) => {
  const isMethodWithBody = METHODS_WITH_BODY.includes(method);
  return nonRegExpSchema(
    z.strictObject({
      headers: mappedEntitySchema.optional(),
      cookies: mappedEntitySchema.optional(),
      params: mappedEntitySchema.optional(),
      query: mappedEntitySchema.optional(),
      ...(isMethodWithBody && { body: plainEntitySchema.optional() })
    })
  );
};

const baseRouteConfigSchema = (method: RestMethod) =>
  z.strictObject({
    entities: entitiesByEntityNameSchema(method).optional(),
    interceptors: nonRegExpSchema(interceptorsSchema.pick({ response: true })).optional()
  });

const dataRouteConfigSchema = (method: RestMethod) =>
  z
    .strictObject({
      settings: settingsSchema.extend({ polling: z.literal(false) }).optional(),
      data: z.union([z.function(), z.any()])
    })
    .merge(baseRouteConfigSchema(method));

const queueRouteConfigSchema = (method: RestMethod) =>
  z
    .strictObject({
      settings: settingsSchema.extend({ polling: z.literal(true) }),
      queue: queueSchema
    })
    .merge(baseRouteConfigSchema(method));

export const routeConfigSchema = (method: RestMethod) =>
  z.union([
    z
      .custom((value) => isPlainObject(value) && 'data' in value && !('queue' in value))
      .pipe(dataRouteConfigSchema(method)),
    z
      .custom((value) => isPlainObject(value) && 'queue' in value && !('data' in value))
      .pipe(queueRouteConfigSchema(method))
  ]);
