import { isPlainObject } from '../../../src/utils/helpers';

export const validateStaticPath = (staticPath: unknown) => {
  const isStaticPathArray = Array.isArray(staticPath);
  if (isStaticPathArray) {
    staticPath.forEach((staticPathElement, index) => {
      const isStaticPathElementObject = isPlainObject(staticPathElement);
      if (isStaticPathElementObject) {
        if (typeof staticPathElement.prefix !== 'string') {
          throw new Error(`staticPath[${index}].prefix`);
        }
        if (typeof staticPathElement.path !== 'string') {
          throw new Error(`staticPath[${index}].path`);
        }
        return;
      }

      if (typeof staticPathElement !== 'string') {
        throw new Error(`staticPath[${index}]`);
      }
    });
    return;
  }

  const isStaticPathObject = isPlainObject(staticPath);
  if (isStaticPathObject) {
    if (typeof staticPath.prefix !== 'string') {
      throw new Error('staticPath.prefix');
    }
    if (typeof staticPath.path !== 'string') {
      throw new Error('staticPath.path');
    }
    return;
  }

  if (typeof staticPath !== 'string' && typeof staticPath !== 'undefined') {
    throw new Error('staticPath');
  }
};
