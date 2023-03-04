import { isPlainObject } from '../../../src/utils/helpers';

export const validateStaticPath = (staticPath: unknown) => {
  const isStaticPathArray = Array.isArray(staticPath);
  if (isStaticPathArray) {
    staticPath.forEach((staticPathElement, index) => {
      const isStaticPathElementObject = isPlainObject(staticPathElement);
      if (isStaticPathElementObject) {
        const { prefix, path } = staticPathElement;
        if (typeof prefix !== 'string' || !prefix.startsWith('/')) {
          throw new Error(`staticPath[${index}].prefix`);
        }
        if (typeof path !== 'string' || !path.startsWith('/')) {
          throw new Error(`staticPath[${index}].path`);
        }
        return;
      }

      if (typeof staticPathElement !== 'string' || !staticPathElement.startsWith('/')) {
        throw new Error(`staticPath[${index}]`);
      }
    });
    return;
  }

  const isStaticPathObject = isPlainObject(staticPath);
  if (isStaticPathObject) {
    const { prefix, path } = staticPath;
    if (typeof prefix !== 'string' || !prefix.startsWith('/')) {
      throw new Error('staticPath.prefix');
    }
    if (typeof path !== 'string' || !path.startsWith('/')) {
      throw new Error('staticPath.path');
    }
    return;
  }

  if (typeof staticPath !== 'string' && typeof staticPath !== 'undefined') {
    throw new Error('staticPath');
  }
  if (typeof staticPath === 'string' && !staticPath.startsWith('/')) {
    throw new Error('staticPath');
  }
};
