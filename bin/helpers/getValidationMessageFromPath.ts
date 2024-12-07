export const getValidationMessageFromPath = (path: (string | number)[]) =>
  path.reduce((validationMessageAcc, pathElement) => {
    if (typeof pathElement === 'number') return `${validationMessageAcc}[${pathElement}]`;
    return `${validationMessageAcc}.${pathElement}`;
  }, '');
