import { flatten } from 'flat';
import type { ParsedUrlQuery } from 'node:querystring';

const OPERATORS = {
  neq: (a: any, b: any) => `${a}` !== `${b}`,
  gt: (a: any, b: any) => +a > +b,
  gte: (a: any, b: any) => +a >= +b,
  lt: (a: any, b: any) => +a < +b,
  lte: (a: any, b: any) => +a <= +b,
  cn: (a: any, b: any) => a.includes(b),
  ncn: (a: any, b: any) => !a.includes(b),
  sw: (a: any, b: any) => a.startsWith(b),
  nsw: (a: any, b: any) => !a.startsWith(b),
  ew: (a: any, b: any) => a.endsWith(b),
  new: (a: any, b: any) => !a.endsWith(b)
} as const;

const OPERATORS_KEYS = Object.keys(OPERATORS);
const OPERATOR_REGEXP = new RegExp(`^(.+)_(${OPERATORS_KEYS.join('|')})$`);

const getEntities = (object: any, key: string) => {
  const parts = key.match(OPERATOR_REGEXP);

  if (parts) {
    const [, element, operator] = parts;
    return {
      element: object[element],
      operator: operator as keyof typeof OPERATORS
    };
  }

  return {
    element: object[key]
  };
};
const filtered = (element: any, value: any, operator?: keyof typeof OPERATORS) => {
  if (!operator) return `${element}` === value;

  return OPERATORS[operator](element, value);
};

export const filter = (array: any[], filters: ParsedUrlQuery) =>
  array.filter((arrayElement) => {
    const flattenedArrayElement = flatten<any, any>(arrayElement);

    return Object.entries(filters).every(([key, filter]) => {
      if (Array.isArray(filter)) {
        const { element, operator } = getEntities(flattenedArrayElement, key);
        return filter.some((value) => filtered(element, value, operator));
      }

      const { element, operator } = getEntities(flattenedArrayElement, key);
      return filtered(element, filter, operator);
    });
  });
