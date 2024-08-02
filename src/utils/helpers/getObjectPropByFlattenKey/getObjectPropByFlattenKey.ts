export const getObjectPropByFlattenKey = (objectOrArray: any, flattenKey?: string) => {
  if (!flattenKey) return objectOrArray;
  try {
    return flattenKey.split('.').reduce((acc, key) => acc[key], objectOrArray);
  } catch (error) {
    return undefined;
  }
};
