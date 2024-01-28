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

const getEntities = (object: any, key: string) => {
  const [element, operator] = key.split('_');

  return {
    element: object[element],
    operator
  };
};
const filtered = (element: any, value: any, operator?: string) => {
  if (!operator || !OPERATORS_KEYS.includes(operator)) return `${element}` === value;

  console.log(
    '@',
    element,
    value,
    operator,
    OPERATORS[operator as keyof typeof OPERATORS](element, value)
  );
  return OPERATORS[operator as keyof typeof OPERATORS](element, value);
};

export const filter = (array: any[], filters: ParsedUrlQuery) =>
  array.filter((element) => {
    const flattenedElement = flatten<any, any>(element);

    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        const { element, operator } = getEntities(flattenedElement, key);
        return value.some((value) => filtered(element, value, operator));
      }

      const { element, operator } = getEntities(flattenedElement, key);
      return filtered(element, value, operator);
    });
  });
