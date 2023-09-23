import { flatten } from 'flat';

export const filter = (array: any[], filters: Record<string, string | string[]>) =>
  array.filter((element) => {
    const flattenedElement = flatten<any, any>(element);

    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(`${flattenedElement[key]}`);
      }

      return `${flattenedElement[key]}` === value;
    });
  });
