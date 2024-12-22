import type { ParamsDictionary, Query as ExpressQuery } from 'express-serve-static-core';
import type { IncomingHttpHeaders } from 'http';

export type PlainObject = Record<string, any>;

export type Primitive = boolean | number | bigint | string | null | undefined | symbol;

export type Headers = IncomingHttpHeaders;
export type Query = ExpressQuery;
export type Params = ParamsDictionary;
export type Cookies = Record<string, string>;

export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;
