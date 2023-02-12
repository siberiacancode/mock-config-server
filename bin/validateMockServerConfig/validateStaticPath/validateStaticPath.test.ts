import { validateStaticPath } from './validateStaticPath';

describe('validateStaticPath', () => {
  test('Should correctly handle static path (except arrays and plain objects) only with correct type', () => {
    const correctStaticPaths = ['string', undefined];
    correctStaticPaths.forEach((correctStaticPath) => {
      expect(() => validateStaticPath(correctStaticPath)).not.toThrow(Error);
    });

    const incorrectStaticPaths = [true, 3000, null, () => {}];
    incorrectStaticPaths.forEach((incorrectStaticPath) => {
      expect(() => validateStaticPath(incorrectStaticPath)).toThrow(new Error('staticPath'));
    });
  });

  test('Should correctly handle plain object static path only with correct type', () => {
    const correctObjectStaticPaths = [{ prefix: 'string', path: 'string' }];
    correctObjectStaticPaths.forEach((correctObjectStaticPath) => {
      expect(() => validateStaticPath(correctObjectStaticPath)).not.toThrow(Error);
    });

    const incorrectPrefixObjectStaticPaths = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectPrefixObjectStaticPaths.forEach((incorrectPrefixObjectStaticPath) => {
      expect(() =>
        validateStaticPath({
          prefix: incorrectPrefixObjectStaticPath,
          path: 'string'
        })
      ).toThrow(new Error('staticPath.prefix'));
    });

    const incorrectPathObjectStaticPaths = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectPathObjectStaticPaths.forEach((incorrectPathObjectStaticPath) => {
      expect(() =>
        validateStaticPath({
          prefix: 'string',
          path: incorrectPathObjectStaticPath
        })
      ).toThrow(new Error('staticPath.path'));
    });
  });

  test('Should correctly handle array static path only with correct type', () => {
    const correctArrayStaticPaths = ['string', { prefix: 'string', path: 'string' }];
    correctArrayStaticPaths.forEach((correctArrayStaticPath) => {
      expect(() => validateStaticPath([correctArrayStaticPath])).not.toThrow(Error);
    });

    const incorrectArrayStaticPaths = [true, 3000, null, undefined, [], () => {}];
    incorrectArrayStaticPaths.forEach((incorrectArrayStaticPath) => {
      expect(() => validateStaticPath([incorrectArrayStaticPath])).toThrow(
        new Error('staticPath[0]')
      );
    });

    const incorrectArrayPrefixObjectStaticPaths = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectArrayPrefixObjectStaticPaths.forEach((incorrectArrayPrefixObjectStaticPath) => {
      expect(() =>
        validateStaticPath([
          {
            prefix: incorrectArrayPrefixObjectStaticPath,
            path: 'string'
          }
        ])
      ).toThrow(new Error('staticPath[0].prefix'));
    });

    const incorrectArrayPathObjectStaticPaths = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectArrayPathObjectStaticPaths.forEach((incorrectArrayPathObjectStaticPath) => {
      expect(() =>
        validateStaticPath([
          {
            prefix: 'string',
            path: incorrectArrayPathObjectStaticPath
          }
        ])
      ).toThrow(new Error('staticPath[0].path'));
    });
  });
});
