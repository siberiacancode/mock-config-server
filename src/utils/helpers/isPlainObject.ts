import { PlainObject } from '../types';

export const isPlainObject = (value: any): value is PlainObject =>
  typeof value === 'object' && !Array.isArray(value) && value !== null;
