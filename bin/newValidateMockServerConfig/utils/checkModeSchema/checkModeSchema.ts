import { z } from 'zod';

// TODO delete useless schemas after all

export const checkActualValueCheckModeSchema = z.enum(['exists', 'notExists']);

export const compareWithDescriptorAnyValueCheckModeSchema = z.enum(['equals', 'notEquals']);

export const compareWithDescriptorStringValueCheckModeSchema = z.enum([
  'includes',
  'notIncludes',
  'startsWith',
  'notStartsWith',
  'endsWith',
  'notEndsWith'
]);

export const compareWithDescriptorValueCheckModeSchema = z.union([
  compareWithDescriptorAnyValueCheckModeSchema,
  compareWithDescriptorStringValueCheckModeSchema
]);

export const calculateByDescriptorValueCheckModeSchema = z.enum(['regExp', 'function']);

export const checkModeSchema = z.union([
  checkActualValueCheckModeSchema,
  compareWithDescriptorValueCheckModeSchema,
  calculateByDescriptorValueCheckModeSchema
]);
