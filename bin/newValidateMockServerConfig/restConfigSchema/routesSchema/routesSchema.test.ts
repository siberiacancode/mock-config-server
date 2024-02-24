import { getMostSpecificPathFromError, getValidationMessageFromPath } from '../../../helpers';

import { routeConfigSchema } from './routesSchema';

describe('routeConfigSchema: data and queue combinations', () => {
  test('Should return correct error path on handle object without data and queue properties', () => {
    const schema = routeConfigSchema('get');

    const incorrectRouteConfig = {
      settings: { polling: true }
    };
    const parseResult = schema.safeParse(incorrectRouteConfig);
    expect(parseResult.success).toBe(false);

    if (!parseResult.success) {
      const path = getMostSpecificPathFromError(parseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('');
    }
  });

  test('Should return correct error path on handle object with data and queue properties', () => {
    const schema = routeConfigSchema('get');

    const incorrectRouteConfig = {
      data: {},
      queue: [],
      settings: { polling: true }
    };
    const parseResult = schema.safeParse(incorrectRouteConfig);
    expect(parseResult.success).toBe(false);

    if (!parseResult.success) {
      const path = getMostSpecificPathFromError(parseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('');
    }
  });

  test('Should return correct error path on handle object with only data or queue properties', () => {
    const schema = routeConfigSchema('get');

    const dataIncorrectRouteConfig = {
      entities: null,
      data: {}
    };
    const dataParseResult = schema.safeParse(dataIncorrectRouteConfig);
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
    const queueParseResult = schema.safeParse(queueIncorrectRouteConfig);
    expect(queueParseResult.success).toBe(false);

    if (!queueParseResult.success) {
      const path = getMostSpecificPathFromError(queueParseResult.error);
      const validationMessage = getValidationMessageFromPath(path);
      expect(validationMessage).toBe('.entities');
    }
  });
});
