import { flatten } from 'flat';

export const filter = (array: any[], filters: Record<string, string | string[]>) =>
  array.filter((element) => {
    const flattenedElelement = flatten<any, any>(element);

    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(`${flattenedElelement[key]}`);
      }

      return `${flattenedElelement[key]}` === value;
    });
  });
