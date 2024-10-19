import { z } from 'zod';

import type { FlatMockServerSettings } from '../../src';
import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../helpers';

import { baseUrlSchema } from './baseUrlSchema/baseUrlSchema';
import { corsSchema } from './corsSchema/corsSchema';
import { interceptorsSchema } from './interceptorsSchema/interceptorsSchema';
import { portSchema } from './portSchema/portSchema';
import { staticPathSchema } from './staticPathSchema/staticPathSchema';
import { plainObjectSchema } from './utils';

export const validateFlatMockServerSettings = (flatMockServerSettings: FlatMockServerSettings) => {
  const flatMockServerSettingsSchema = z.strictObject({
    baseUrl: baseUrlSchema.optional(),
    port: portSchema.optional(),
    staticPath: staticPathSchema.optional(),
    interceptors: plainObjectSchema(interceptorsSchema).optional(),
    cors: corsSchema.optional()
  });

  const validationFlatMockServerSettingsResult =
    flatMockServerSettingsSchema.safeParse(flatMockServerSettings);
  if (!validationFlatMockServerSettingsResult.success) {
    const path = getMostSpecificPathFromError(validationFlatMockServerSettingsResult.error);
    const validationMessage = getValidationMessageFromPath(path);

    throw new Error(
      `Validation Error: configuration[0]${validationMessage} does not match the API schema. Click here to see correct type: https://github.com/siberiacancode/mock-config-server`
    );
  }
};
