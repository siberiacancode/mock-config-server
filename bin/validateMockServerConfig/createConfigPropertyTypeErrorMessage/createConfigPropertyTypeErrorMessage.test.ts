import { createConfigPropertyTypeErrorMessage } from './createConfigPropertyTypeErrorMessage';

describe('createConfigPropertyTypeErrorMessage', () => {
  test('Should correctly show config property and it correct type path', () => {
    const configProperty = 'property';
    const configPropertyCorrectTypePath = '#CorrectPropertyTypePath';

    expect(createConfigPropertyTypeErrorMessage(configProperty)).toBe(
      'Validation Error: configuration.property does not match the API schema. Click here to see correct type: https://github.com/siberiacancode/mock-config-server'
    );
    expect(
      createConfigPropertyTypeErrorMessage(configProperty, configPropertyCorrectTypePath)
    ).toBe(
      'Validation Error: configuration.property does not match the API schema. Click here to see correct type: #CorrectPropertyTypePath'
    );
  });
});
