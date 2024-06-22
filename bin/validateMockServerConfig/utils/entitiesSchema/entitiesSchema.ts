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

const extendedDiscriminatedUnionOptionWrapper = (
  ...args: Parameters<typeof entityDescriptorSchema>
) => {
  const [checkModeSchema, valueSchema] = args;
  return [checkModeSchema, entityDescriptorSchema(checkModeSchema, valueSchema)] as const;
};

/* ----- Plain entity schema ----- */

const topLevelPlainEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  extendedDiscriminatedUnionOptionWrapper(checkActualValueCheckModeSchema),
  extendedDiscriminatedUnionOptionWrapper(z.literal('function'), z.function()),
  extendedDiscriminatedUnionOptionWrapper(compareWithDescriptorAnyValueCheckModeSchema, jsonSchema)
]);

const propertyLevelPlainEntityDescriptorSchema = extendedDiscriminatedUnion('checkMode', [
  extendedDiscriminatedUnionOptionWrapper(checkActualValueCheckModeSchema),
  extendedDiscriminatedUnionOptionWrapper(z.literal('function'), z.function()),
  extendedDiscriminatedUnionOptionWrapper(z.literal('regExp'), z.instanceof(RegExp)),
  extendedDiscriminatedUnionOptionWrapper(compareWithDescriptorAnyValueCheckModeSchema, jsonSchema),
  extendedDiscriminatedUnionOptionWrapper(
    compareWithDescriptorStringValueCheckModeSchema,
    jsonLiteralSchema
  )
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
  extendedDiscriminatedUnionOptionWrapper(checkActualValueCheckModeSchema),
  extendedDiscriminatedUnionOptionWrapper(z.literal('function'), z.function()),
  extendedDiscriminatedUnionOptionWrapper(z.literal('regExp'), z.instanceof(RegExp)),
  extendedDiscriminatedUnionOptionWrapper(
    compareWithDescriptorValueCheckModeSchema,
    mappedEntityValueSchema
  )
]);

export const mappedEntitySchema = plainObjectSchema(
  z.record(z.union([mappedEntityValueSchema, mappedEntityDescriptorSchema]))
);
