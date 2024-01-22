import { z } from 'zod';

import { isPlainObject } from '@/utils/helpers';
import type { RestMethod } from '@/utils/types';

import { interceptorsSchema } from '../../interceptorsSchema/interceptorsSchema';
import { queueSchema } from '../../queueSchema/queueSchema';
import { settingsSchema } from '../../settingsSchema/settingsSchema';
import { nonRegExpSchema } from '../../utils';

import { entitiesByEntityNameSchema } from './entitiesSchema/entitiesSchema';

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
