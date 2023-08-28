import { flatten } from 'flat';

export const filter = (array: any[], object: Record<string, string>) =>
  array.filter((element) => {
    const flattenedElelement = flatten<any, any>(element);

    return !Object.entries(object).some(([key, value]) => {
      if (!flattenedElelement[key]) return false;

      if (Array.isArray(value)) {
        return !value.includes(flattenedElelement[key]?.toString());
      }

      return flattenedElelement[key]?.toString() !== value;
    });
  });
