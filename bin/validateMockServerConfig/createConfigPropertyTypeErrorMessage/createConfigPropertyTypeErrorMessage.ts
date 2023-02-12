export const createConfigPropertyTypeErrorMessage = (
  configProperty: string,
  configPropertyCorrectTypePath?: string
) =>
  `Validation Error: configuration.${configProperty} does not match the API schema. Click here to see correct type: ${
    configPropertyCorrectTypePath ?? 'https://github.com/siberiacancode/mock-config-server'
  }`;
