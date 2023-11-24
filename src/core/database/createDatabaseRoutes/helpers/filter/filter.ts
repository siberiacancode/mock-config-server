import { flatten } from 'flat';
import type { ParsedUrlQuery } from 'node:querystring';

export const filter = (array: any[], filters: ParsedUrlQuery) =>
  array.filter((element) => {
    const flattenedElement = flatten<any, any>(element);

    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(`${flattenedElement[key]}`);
      }

      return `${flattenedElement[key]}` === value;
    });
  });
