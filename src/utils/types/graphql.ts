export type GraphQLVariables = Record<string, any>;
export interface GraphQLInput {
  query: string | undefined;
  variables?: GraphQLVariables;
}
