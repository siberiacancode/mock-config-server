import { z } from 'zod';

import type { RestMethod } from '@/utils/types';

import {
  checkActualValueCheckModeSchema,
  compareWithDescriptorAnyValueCheckModeSchema,
  compareWithDescriptorStringValueCheckModeSchema,
  compareWithDescriptorValueCheckModeSchema,
  nestedObjectOrArraySchema
} from '../../../utils';

/* ----- Mapped entity schema ----- */

const mappedEntityValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const mappedEntityDescriptorSchema = z.discriminatedUnion('checkMode', [
  z.object({ checkMode: z.literal('function'), value: z.function() }).strict(),
  z
    .object({
      checkMode: z.literal('regExp'),
      value: z.union([z.instanceof(RegExp), z.array(z.instanceof(RegExp))])
    })
    .strict(),
  z
    .object({
      checkMode: compareWithDescriptorValueCheckModeSchema,
      value: z.union([mappedEntityValueSchema, z.array(mappedEntityValueSchema)])
    })
    .strict(),
  z
    .object({
      checkMode: checkActualValueCheckModeSchema
    })
    .strict()
]);

export const mappedEntitySchema = z.record(
  z.union([mappedEntityValueSchema, z.array(mappedEntityValueSchema), mappedEntityDescriptorSchema])
);

/* ----- Plain entity schema ----- */

const plainEntityValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const topLevelPlainEntityDescriptorSchema = z.discriminatedUnion('checkMode', [
  z.object({ checkMode: z.literal('function'), value: z.function() }).strict(),
  z
    .object({
      checkMode: compareWithDescriptorAnyValueCheckModeSchema,
      value: nestedObjectOrArraySchema(plainEntityValueSchema)
    })
    .strict(),
  z
    .object({
      checkMode: checkActualValueCheckModeSchema
    })
    .strict()
]);

const propertyLevelPlainEntityDescriptorSchema = z.discriminatedUnion('checkMode', [
  z.object({ checkMode: z.literal('function'), value: z.function() }).strict(),
  z
    .object({
      checkMode: compareWithDescriptorAnyValueCheckModeSchema,
      value: z.union([plainEntityValueSchema, nestedObjectOrArraySchema(plainEntityValueSchema)])
    })
    .strict(),
  z
    .object({
      checkMode: compareWithDescriptorStringValueCheckModeSchema,
      value: z.union([plainEntityValueSchema, z.array(plainEntityValueSchema)])
    })
    .strict(),
  z
    .object({
      checkMode: checkActualValueCheckModeSchema
    })
    .strict()
]);

export const plainEntitySchema = z.union([
  topLevelPlainEntityDescriptorSchema,
  z.record(propertyLevelPlainEntityDescriptorSchema),
  nestedObjectOrArraySchema(plainEntityValueSchema)
]);

/* ----- Entities by entity name schema ----- */

export const entitiesByEntityNameSchema = (method: RestMethod) => {
  const isMethodWithBody = ['post', 'put', 'patch'].includes(method);
  return z
    .object({
      headers: mappedEntitySchema.optional(),
      cookies: mappedEntitySchema.optional(),
      params: mappedEntitySchema.optional(),
      query: mappedEntitySchema.optional(),
      ...(isMethodWithBody && { body: plainEntitySchema.optional() })
    })
    .strict();
};
