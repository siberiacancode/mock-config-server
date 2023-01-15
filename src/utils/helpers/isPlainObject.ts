export const isPlainObject = (value: any) =>
  typeof value === 'object' && !Array.isArray(value) && value !== null;
