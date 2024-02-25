import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../../../helpers';

import { routeConfigSchema } from './routesSchema';

describe('routeConfigSchema: data resolving properties combinations', () => {
  test('Should return correct error path on handle object without data resolving properties', () => {
    const incorrectRouteConfig = {
      settings: { polling: true }
    };
    const parseResult = routeConfigSchema.safeParse(incorrectRouteConfig);
    expect(parseResult.success).toBe(false);

    if (!parseResult.success) {
      const path = getMostSpecificPathFromError(parseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('');
    }
  });

  test('Should return correct error path on handle object with more than one data resolving properties', () => {
    const incorrectRouteConfig = {
      data: {},
      queue: [],
      settings: { polling: true }
    };
    const parseResult = routeConfigSchema.safeParse(incorrectRouteConfig);
    expect(parseResult.success).toBe(false);

    if (!parseResult.success) {
      const path = getMostSpecificPathFromError(parseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('');
    }
  });

  test('Should return correct error path on handle object with only one data resolving property', () => {
    const dataIncorrectRouteConfig = {
      entities: null,
      data: {}
    };
    const dataParseResult = routeConfigSchema.safeParse(dataIncorrectRouteConfig);
    expect(dataParseResult.success).toBe(false);

    if (!dataParseResult.success) {
      const path = getMostSpecificPathFromError(dataParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.entities');
    }

    const queueIncorrectRouteConfig = {
      entities: null,
      settings: { polling: true },
      queue: []
    };
    const queueParseResult = routeConfigSchema.safeParse(queueIncorrectRouteConfig);
    expect(queueParseResult.success).toBe(false);

    if (!queueParseResult.success) {
      const path = getMostSpecificPathFromError(queueParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.entities');
    }
  });
});
