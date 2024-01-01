import { z } from 'zod';

import type { RestMethod } from '@/utils/types';

import { interceptorsSchema } from '../../interceptorsSchema/interceptorsSchema';
import { queueSchema } from '../../queueSchema/queueSchema';
import { settingsSchema } from '../../settingsSchema/settingsSchema';

import { entitiesByEntityNameSchema } from './entitiesSchema/entitiesSchema';

const baseRouteConfigSchema = (method: RestMethod) =>
  z
    .object({
      entities: entitiesByEntityNameSchema(method).optional(),
      interceptors: interceptorsSchema.pick({ response: true }).optional()
    })
    .strict();

const queueRouteConfigSchema = (method: RestMethod) =>
  z
    .object({
      settings: settingsSchema.extend({ polling: z.literal(true) }),
      queue: queueSchema
    })
    .strict()
    .merge(baseRouteConfigSchema(method));

const dataRouteConfigSchema = (method: RestMethod) =>
  z
    .object({
      settings: settingsSchema.extend({ polling: z.literal(false) }).optional(),
      data: z.union([z.function(), z.any()])
    })
    .strict()
    .merge(baseRouteConfigSchema(method));

export const routeConfigSchema = (method: RestMethod) =>
  z.union([queueRouteConfigSchema(method), dataRouteConfigSchema(method)]);
