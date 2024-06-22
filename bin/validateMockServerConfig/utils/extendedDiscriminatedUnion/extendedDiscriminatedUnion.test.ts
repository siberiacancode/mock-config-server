import { z } from 'zod';

import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../../../helpers';

import { extendedDiscriminatedUnion } from './extendedDiscriminatedUnion';

test('Should return correct error path if discriminator is not presented in parsed value', () => {
  const value = {
    property: { age: 34 }
  };
  const schema = z.object({
    property: extendedDiscriminatedUnion('name', [
      [z.literal('John'), z.object({ name: z.string(), age: z.number() })],
      [z.literal('Jane'), z.object({ name: z.string(), age: z.number() })]
    ])
  });

  const schemaParseResult = schema.safeParse(value);
  expect(schemaParseResult.success).toBe(false);

  if (!schemaParseResult.success) {
    const path = getMostSpecificPathFromError(schemaParseResult.error);
    const validationMessage = getValidationMessageFromPath(path);
    expect(validationMessage).toBe('.property');
  }
});

test('Should return correct error path if none of passed options have matched discriminator schema', () => {
  const value = {
    property: { name: 'Jack', age: 34 }
  };
  const schema = z.object({
    property: extendedDiscriminatedUnion('name', [
      [z.literal('John'), z.object({ name: z.string(), age: z.number() })],
      [z.literal('Jane'), z.object({ name: z.string(), age: z.number() })]
    ])
  });

  const schemaParseResult = schema.safeParse(value);
  expect(schemaParseResult.success).toBe(false);

  if (!schemaParseResult.success) {
    const path = getMostSpecificPathFromError(schemaParseResult.error);
    const validationMessage = getValidationMessageFromPath(path);
    expect(validationMessage).toBe('.property.name');
  }
});

test('Should return correct error path if none of passed options have matched rest of properties schema', () => {
  const value = {
    property: { name: 'John', age: true }
  };
  const schema = z.object({
    property: extendedDiscriminatedUnion('name', [
      [z.literal('John'), z.object({ name: z.string(), age: z.number() })],
      [z.literal('Jane'), z.object({ name: z.string(), age: z.number() })]
    ])
  });

  const schemaParseResult = schema.safeParse(value);
  expect(schemaParseResult.success).toBe(false);

  if (!schemaParseResult.success) {
    const path = getMostSpecificPathFromError(schemaParseResult.error);
    const validationMessage = getValidationMessageFromPath(path);
    expect(validationMessage).toBe('.property.age');
  }
});
