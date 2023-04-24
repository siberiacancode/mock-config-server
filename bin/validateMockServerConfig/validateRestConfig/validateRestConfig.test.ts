import { validateRestConfig } from './validateRestConfig';

describe('validateRestConfig', () => {
  test('Should correctly handle rest config only with correct type', () => {
    const correctRestConfigs = [
      { configs: [{ path: '/path', method: 'get', routes: [] }] },
      undefined
    ];
    correctRestConfigs.forEach((correctRestConfig) => {
      expect(() => validateRestConfig(correctRestConfig)).not.toThrow(Error);
    });

    const incorrectRestConfigs = ['string', true, 3000, null, [], () => {}];
    incorrectRestConfigs.forEach((incorrectRestConfig) => {
      expect(() => validateRestConfig(incorrectRestConfig)).toThrow(new Error('rest'));
    });
  });

  test('Should correctly handle config path only with correct type', () => {
    const correctConfigPathValues = ['/pathWithLeadingSlash', /\/path/];
    correctConfigPathValues.forEach((correctConfigPathValue) => {
      expect(() =>
        validateRestConfig({
          configs: [
            {
              path: correctConfigPathValue,
              method: 'get',
              routes: []
            }
          ]
        })
      ).not.toThrow(Error);
    });

    const incorrectConfigPathValues = [
      'pathWithoutLeadingSlash',
      true,
      3000,
      null,
      undefined,
      {},
      [],
      () => {}
    ];
    incorrectConfigPathValues.forEach((incorrectConfigPathValue) => {
      expect(() =>
        validateRestConfig({
          configs: [
            {
              path: incorrectConfigPathValue,
              method: 'get',
              routes: []
            }
          ]
        })
      ).toThrow('rest.configs[0].path');
    });
  });

  test('Should correctly handle config method only with correct type', () => {
    const correctConfigMethodValues = ['get', 'post', 'put', 'patch', 'delete', 'options'];
    correctConfigMethodValues.forEach((correctConfigMethodValue) => {
      expect(() =>
        validateRestConfig({
          configs: [
            {
              path: '/path',
              method: correctConfigMethodValue,
              routes: []
            }
          ]
        })
      ).not.toThrow(Error);
    });

    const incorrectConfigMethodValues = ['string', true, 3000, null, undefined, {}, [], () => {}];
    incorrectConfigMethodValues.forEach((incorrectConfigMethodValue) => {
      expect(() =>
        validateRestConfig({
          configs: [
            {
              path: '/path',
              method: incorrectConfigMethodValue,
              routes: []
            }
          ]
        })
      ).toThrow('rest.configs[0].method');
    });
  });
});
