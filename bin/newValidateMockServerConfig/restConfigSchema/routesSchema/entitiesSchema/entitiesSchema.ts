import { z } from 'zod';

import type { RestMethod } from '@/utils/types';

import {
  checkActualValueCheckModeSchema,
  compareWithDescriptorAnyValueCheckModeSchema,
  compareWithDescriptorStringValueCheckModeSchema,
  compareWithDescriptorValueCheckModeSchema,
  jsonLiteralSchema,
  jsonSchema,
  plainObjectSchema
} from '../../../utils';

/* ----- Mapped entity schema ----- */

const mappedEntityValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const mappedEntityDescriptorSchema = plainObjectSchema(
  z.discriminatedUnion('checkMode', [
    z.strictObject({
      checkMode: z.literal('function'),
      value: z.function()
    }),
    z.strictObject({
      checkMode: z.literal('regExp'),
      value: z.union([z.instanceof(RegExp), z.array(z.instanceof(RegExp))])
    }),
    z.strictObject({
      checkMode: compareWithDescriptorValueCheckModeSchema,
      value: z.union([mappedEntityValueSchema, z.array(mappedEntityValueSchema)])
    }),
    z.strictObject({
      checkMode: checkActualValueCheckModeSchema
    })
  ]),
  ['checkMode']
);

const mappedEntitySchema = plainObjectSchema(
  z.record(
    z.union([
      mappedEntityValueSchema,
      z.array(mappedEntityValueSchema),
      mappedEntityDescriptorSchema
    ])
  )
);

/* ----- Plain entity schema ----- */

const topLevelPlainEntityDescriptorSchema = plainObjectSchema(
  z.discriminatedUnion('checkMode', [
    z.strictObject({
      checkMode: z.literal('function'),
      value: z.function()
    }),
    z.strictObject({
      checkMode: compareWithDescriptorAnyValueCheckModeSchema,
      value: jsonSchema
    }),
    z.strictObject({
      checkMode: checkActualValueCheckModeSchema
    })
  ]),
  ['checkMode']
);

const propertyLevelPlainEntityDescriptorSchema = plainObjectSchema(
  z.discriminatedUnion('checkMode', [
    z.strictObject({
      checkMode: z.literal('function'),
      value: z.function()
    }),
    z.strictObject({
      checkMode: compareWithDescriptorAnyValueCheckModeSchema,
      value: jsonSchema
    }),
    z.strictObject({
      checkMode: compareWithDescriptorStringValueCheckModeSchema,
      value: z.union([jsonLiteralSchema, z.array(jsonLiteralSchema)])
    }),
    z.strictObject({
      checkMode: checkActualValueCheckModeSchema
    })
  ]),
  ['checkMode']
);

const nonCheckModeRecordSchema = (recordSchema: ReturnType<typeof z.record>) =>
  plainObjectSchema(recordSchema.and(z.object({ checkMode: z.never().optional() })));

// ✅ important:
// 1st property level record disallow checkMode
const topLevelRecordValueSchema = z.union([
  jsonLiteralSchema,
  z.array(jsonSchema),
  nonCheckModeRecordSchema(z.record(jsonSchema))
]);

// ✅ important:
// top level record disallow checkMode
const topLevelRecordSchema = nonCheckModeRecordSchema(
  z.record(z.union([propertyLevelPlainEntityDescriptorSchema, topLevelRecordValueSchema]))
);

const topLevelArraySchema = z.array(
  jsonSchema.and(z.custom((value) => !jsonLiteralSchema.safeParse(value).success))
);

const plainEntitySchema = z.union([
  topLevelPlainEntityDescriptorSchema,
  topLevelRecordSchema,
  topLevelArraySchema
]);

/* ----- Entities by entity name schema ----- */

const METHODS_WITH_BODY = ['post', 'put', 'patch'];
export const entitiesByEntityNameSchema = (method: RestMethod) => {
  const isMethodWithBody = METHODS_WITH_BODY.includes(method);
  return plainObjectSchema(
    z.strictObject({
      headers: mappedEntitySchema.optional(),
      cookies: mappedEntitySchema.optional(),
      params: mappedEntitySchema.optional(),
      query: mappedEntitySchema.optional(),
      ...(isMethodWithBody && { body: plainEntitySchema.optional() })
    })
  );
};
