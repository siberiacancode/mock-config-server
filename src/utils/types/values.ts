import type { ParamsDictionary } from 'express-serve-static-core';
import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';

export type PlainObject = Record<string, any>;
export type PlainFunction = (...args: any[]) => any;

export type Primitive = boolean | number | bigint | string | null | undefined | symbol;

export type Headers = IncomingHttpHeaders;
export type Query = ParsedQs;
export type Params = ParamsDictionary;
export type Cookies = Record<string, string>;

export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;
