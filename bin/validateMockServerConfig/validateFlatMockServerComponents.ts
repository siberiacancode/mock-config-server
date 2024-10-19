import { z } from 'zod';

import type { FlatMockServerComponent } from '../../src';
import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../helpers';

import { baseUrlSchema } from './baseUrlSchema/baseUrlSchema';
import { databaseConfigSchema } from './databaseConfigSchema/databaseConfigSchema';
import { requestConfigSchema as graphqlRequestConfigSchema } from './graphqlConfigSchema/graphqlConfigSchema';
import { interceptorsSchema } from './interceptorsSchema/interceptorsSchema';
import { requestConfigSchema as restRequestConfigSchema } from './restConfigSchema/restConfigSchema';
import { plainObjectSchema } from './utils';

export const validateFlatMockServerComponents = (
  flatMockServerComponents: FlatMockServerComponent[]
) => {
  if (!flatMockServerComponents.length) {
    throw new Error(
      'Components should contain at least one element; see our doc (https://github.com/siberiacancode/mock-config-server) for more information'
    );
  }

  const flatMockServerComponentsSchema = z.array(
    z.strictObject({
      name: z.string().optional(),
      baseUrl: baseUrlSchema.optional(),
      interceptors: plainObjectSchema(interceptorsSchema).optional(),
      configs: z.array(z.union([restRequestConfigSchema, graphqlRequestConfigSchema])),
      database: databaseConfigSchema.optional()
    })
  );

  const validationFlatMockServerSettingsResult =
    flatMockServerComponentsSchema.safeParse(flatMockServerComponents);
  if (!validationFlatMockServerSettingsResult.success) {
    const path = getMostSpecificPathFromError(validationFlatMockServerSettingsResult.error);
    const validationMessage = getValidationMessageFromPath(path);

    throw new Error(
      `Validation Error: configuration${validationMessage} does not match the API schema. Click here to see correct type: https://github.com/siberiacancode/mock-config-server`
    );
  }
};
