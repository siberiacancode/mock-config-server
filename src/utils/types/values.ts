import { ParsedQs } from 'qs';

export type BodyValue = any;
export type VariablesValue = any;
export type QueryValue = ParsedQs;
export type HeadersValue = Record<string, string | string[] | undefined>;
export type ParamsValue = Record<string, string | string[] | undefined>;

export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;
