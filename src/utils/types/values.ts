import type { ParsedQs } from 'qs';

export type PlainObject = Record<string, any>;
export type PlainFunction = (...args: any[]) => any;

export type BodyValue = any;
export type VariablesValue = any;
export type QueryValue = ParsedQs;
export type HeadersValue = Record<string, string>;
export type CookiesValue = Record<string, string>;
export type ParamsValue = Record<string, string>;

export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;
