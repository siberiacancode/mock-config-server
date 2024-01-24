import { z } from 'zod';

import {
  checkActualValueCheckModeSchema,
  compareWithDescriptorAnyValueCheckModeSchema,
  compareWithDescriptorStringValueCheckModeSchema,
  compareWithDescriptorValueCheckModeSchema
} from '../checkModeSchema/checkModeSchema';
import { jsonLiteralSchema, jsonSchema } from '../jsonSchema/jsonSchema';
import { nonRegExpSchema } from '../nonRegExpSchema/nonRegExpSchema';
import { requiredPropertiesSchema } from '../plainObjectSchema/plainObjectSchema';

/* ----- Plain entity schema ----- */

const topLevelPlainEntityDescriptorSchema = requiredPropertiesSchema(
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

const propertyLevelPlainEntityDescriptorSchema = requiredPropertiesSchema(
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
  nonRegExpSchema(recordSchema.and(z.object({ checkMode: z.never().optional() })));

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

export const plainEntitySchema = z.union([
  topLevelPlainEntityDescriptorSchema,
  topLevelRecordSchema,
  topLevelArraySchema
]);

/* ----- Mapped entity schema ----- */

const mappedEntityValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const mappedEntityDescriptorSchema = requiredPropertiesSchema(
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

export const mappedEntitySchema = nonRegExpSchema(
  z.record(
    z.union([
      mappedEntityValueSchema,
      z.array(mappedEntityValueSchema),
      mappedEntityDescriptorSchema
    ])
  )
);
