import { isPlainObject } from '../../../src/utils/helpers';
import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

export const validateStaticPath = (staticPath: any) => {
  const isStaticPathArray = Array.isArray(staticPath);
  if (isStaticPathArray) {
    staticPath.forEach((staticPathElement, index) => {
      const isStaticPathElementObject = isPlainObject(staticPathElement);
      if (isStaticPathElementObject) {
        const { prefix, path } = staticPathElement;
        if (typeof prefix !== 'string') {
          throw new Error(createValidationErrorMessage(`staticPath[${index}].prefix`, 'string'));
        }
        if (typeof path !== 'string') {
          throw new Error(createValidationErrorMessage(`staticPath[${index}].path`, 'string'));
        }
        return;
      }

      if (typeof staticPathElement !== 'string') {
        throw new Error(
          createValidationErrorMessage(
            `staticPath[${index}]`,
            'string | { prefix: string; path: string }'
          )
        );
      }
    });
    return;
  }

  const isStaticPathObject = isPlainObject(staticPath);
  if (isStaticPathObject) {
    const { prefix, path } = staticPath;
    if (typeof prefix !== 'string') {
      throw new Error(createValidationErrorMessage(`staticPath.prefix`, 'string'));
    }
    if (typeof path !== 'string') {
      throw new Error(createValidationErrorMessage(`staticPath.path`, 'string'));
    }
    return;
  }

  if (typeof staticPath !== 'string' && typeof staticPath !== 'undefined') {
    throw new Error(
      createValidationErrorMessage(
        'staticPath',
        'string | { prefix: string; path: string } | (string | { prefix: string; path: string })[] | undefined'
      )
    );
  }
};
