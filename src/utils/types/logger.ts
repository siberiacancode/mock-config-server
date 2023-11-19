// import type { Request, Response } from 'express';

// import type { GraphQLEntityName } from './graphql';
// import type { RestEntityName } from './rest';


// export interface RequestLoggerOptions<OptionsKeys extends RestEntityName | GraphQLEntityName> {
//   // logger: RequestLogger<EntityNames>;
//   // unixTimestamp: number;
//   options?: Partial<Record<OptionsKeys, boolean>>;
//   // request: Request;
// }

export type RequestLoggerOptions<OptionsKeys extends string = string> = Partial<
  Record<OptionsKeys, boolean>
>;

// export type RequestLogFunction<EntityNames extends RestEntityName | GraphQLEntityName> = (
//   params: RequestLogFunctionParams<EntityNames>,
//   request: Request
// ) => void;

export interface RequestLogger<OptionsKeys extends string = string> {
  enabled: boolean;
  // logFunction?: RequestLogFunction<EntityNames>;
  options?: RequestLoggerOptions<OptionsKeys>;
}



// export interface ResponseLogFunctionParams<EntityNames extends RestEntityName | GraphQLEntityName> {
//   // logger: ResponseLogger<EntityNames>;
//   // unixTimestamp: number;
//   entities?: Partial<Record<EntityNames, boolean>>;
//   // request: Request;
//   // response?: Response;
// }

export type ResponseLoggerOptions<OptionsKeys extends string = string> = Partial<
  Record<OptionsKeys, boolean>
>;

// export type ResponseLogFunction<EntityNames extends RestEntityName | GraphQLEntityName> = (
//   params: ResponseLogFunctionParams<EntityNames>,
//   request: Request,
//   response: Response
// ) => void;

export interface ResponseLogger<OptionsKeys extends string = string> {
  enabled: boolean;
  // logFunction?: ResponseLogFunction<EntityNames>;
  options?: ResponseLoggerOptions<OptionsKeys>;
}



export interface Loggers<RequestLoggerOptionsKeys extends string = string, ResponseLoggerOptionsKeys extends string = string> {
  request?: RequestLogger<RequestLoggerOptionsKeys>;
  response?: ResponseLogger<ResponseLoggerOptionsKeys>;
}
