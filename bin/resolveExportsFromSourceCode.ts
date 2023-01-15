export const resolveExportsFromSourceCode = (sourceCode: string) => {
  // @ts-ignore
  const moduleInstance = new module.constructor();
  // eslint-disable-next-line no-underscore-dangle
  moduleInstance._compile(sourceCode, '');
  return moduleInstance.exports;
};
