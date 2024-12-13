import { z } from 'zod';

import {
  checkActualValueCheckModeSchema,
  compareWithDescriptorAnyValueCheckModeSchema,
  compareWithDescriptorStringValueCheckModeSchema,
  compareWithDescriptorValueCheckModeSchema,
  entityDescriptorSchema
} from '../checkModeSchema/checkModeSchema';
import { extendedDiscriminatedUnion } from '../extendedDiscriminatedUnion/extendedDiscriminatedUnion';
import { jsonLiteralSchema, jsonSchema } from '../jsonSchema/jsonSchema';
import { plainObjectSchema } from '../plainObjectSchema/plainObjectSchema';

/* ----- Plain entity schema ----- */

const topLevelPlainEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  [checkActualValueCheckModeSchema, entityDescriptorSchema(checkActualValueCheckModeSchema)],
  [z.literal('function'), entityDescriptorSchema(z.literal('function'), z.function())],
  [
    compareWithDescriptorAnyValueCheckModeSchema,
    entityDescriptorSchema(compareWithDescriptorAnyValueCheckModeSchema, jsonSchema)
  ]
]);

const propertyLevelPlainEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  [checkActualValueCheckModeSchema, entityDescriptorSchema(checkActualValueCheckModeSchema)],
  [z.literal('function'), entityDescriptorSchema(z.literal('function'), z.function())],
  [z.literal('regExp'), entityDescriptorSchema(z.literal('regExp'), z.instanceof(RegExp))],
  [
    compareWithDescriptorAnyValueCheckModeSchema,
    entityDescriptorSchema(compareWithDescriptorAnyValueCheckModeSchema, jsonSchema)
  ],
  [
    compareWithDescriptorStringValueCheckModeSchema,
    entityDescriptorSchema(compareWithDescriptorStringValueCheckModeSchema, jsonLiteralSchema)
  ]
]);

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

const topLevelArraySchema = z.array(jsonSchema);

export const plainEntitySchema = z.union([
  topLevelPlainEntityDescriptorSchema,
  topLevelRecordSchema,
  topLevelArraySchema
]);

/* ----- Mapped entity schema ----- */

const mappedEntityValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const mappedEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  [checkActualValueCheckModeSchema, entityDescriptorSchema(checkActualValueCheckModeSchema)],
  [z.literal('function'), entityDescriptorSchema(z.literal('function'), z.function())],
  [z.literal('regExp'), entityDescriptorSchema(z.literal('regExp'), z.instanceof(RegExp))],
  [
    compareWithDescriptorValueCheckModeSchema,
    entityDescriptorSchema(compareWithDescriptorValueCheckModeSchema, mappedEntityValueSchema)
  ]
]);

export const mappedEntitySchema = plainObjectSchema(
  z.record(z.union([mappedEntityValueSchema, mappedEntityDescriptorSchema]))
);
