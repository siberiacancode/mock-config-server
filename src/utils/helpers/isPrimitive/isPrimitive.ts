export const isPrimitive = (value: any): value is boolean | number | bigint | string | null | undefined | symbol =>
  value !== Object(value);
