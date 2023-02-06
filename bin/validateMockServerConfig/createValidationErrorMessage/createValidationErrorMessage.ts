export const createValidationErrorMessage = (configProp: string, configPropCorrectTypes?: string) =>
  `Validation Error: Invalid configuration object does not match the API schema. configuration.${configProp} should has types: ${configPropCorrectTypes ?? '(see our doc: https://github.com/siberiacancode/mock-config-server)'}`;
