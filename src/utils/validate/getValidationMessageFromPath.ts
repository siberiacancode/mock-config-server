export const getValidationMessageFromPath = (path: (number | string)[]) =>
  path.reduce((validationMessageAcc, pathElement) => {
    if (typeof pathElement === 'number') return `${validationMessageAcc}[${pathElement}]`;
    return `${validationMessageAcc}.${pathElement}`;
  }, '');
