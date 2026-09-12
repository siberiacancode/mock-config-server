import type {
  GraphQLEntitiesByEntityName,
  GraphQLExecutionResult,
  GraphQLIdentifier,
  GraphQLOperationType,
  GraphQLParams,
  GraphQLRequestConfig,
  GraphQLRouteConfig,
  GraphQLSettings,
  GraphqlTransportWsEntitiesByEntityName,
  GraphqlTransportWsExecutionResult,
  GraphqlTransportWsParams,
  GraphqlTransportWsRequestConfig,
  GraphqlTransportWsRouteConfig,
  GraphqlTransportWsSettings,
  MaybePromise
} from '@/utils/types';

import { graphql as graphqlInterceptors } from '@/core/interceptors';
import { isGeneratorFunction } from '@/utils/helpers';

import { createGenerator } from '../shared/helpers';
import { createPollingHandler } from './helpers';

const GRAPHQL_POLLING_CONFIG = Symbol('mock-config-server.graphql.polling');

interface GraphQLRequestInput {
  body?: unknown;
  params?: unknown;
  queries?: unknown;
  response?: GraphQLExecutionResult;
}

type GraphQLFactorySettings = GraphQLSettings & {
  match?: GraphQLEntitiesByEntityName;
};

type GraphQLInlineResponse<Input extends GraphQLRequestInput> =
  Input['response'] extends GraphQLExecutionResult ? Input['response'] : GraphQLExecutionResult;

type GraphQLFunction<Input extends GraphQLRequestInput> = (
  params: GraphQLParams<
    Input['queries'],
    Input['body'],
    Input['params'],
    GraphQLInlineResponse<Input>
  >
) => MaybePromise<GraphQLInlineResponse<Input>>;

type GraphQLGeneratorFunction<Input extends GraphQLRequestInput> = (
  params: GraphQLParams<
    Input['queries'],
    Input['body'],
    Input['params'],
    GraphQLInlineResponse<Input>
  >
) => Generator<
  GraphQLInlineResponse<Input>,
  GraphQLInlineResponse<Input>,
  GraphQLParams<Input['queries'], Input['body'], Input['params'], GraphQLInlineResponse<Input>>
>;

type GraphQLPollingItem<Input extends GraphQLRequestInput> =
  | { handler: GraphQLFunction<Input>; time?: number }
  | { response: GraphQLInlineResponse<Input>; time?: number };

type GraphQLPolling<Input extends GraphQLRequestInput> = GraphQLPollingItem<Input>[];

interface GraphQLPollingObject<Input extends GraphQLRequestInput> {
  readonly [GRAPHQL_POLLING_CONFIG]: true;
  polling: GraphQLPolling<Input>;
}

type GraphQLConfig<Input extends GraphQLRequestInput> =
  | GraphQLFunction<Input>
  | GraphQLGeneratorFunction<Input>
  | GraphQLInlineResponse<Input>
  | GraphQLPollingObject<Input>;

interface GraphqlTransportWsRequestInput {
  response?: GraphqlTransportWsExecutionResult;
}

type GraphqlTransportWsFactorySettings = GraphqlTransportWsSettings & {
  match?: GraphqlTransportWsEntitiesByEntityName;
};

type GraphqlTransportWsInlineResponse<Input extends GraphqlTransportWsRequestInput> =
  Input['response'] extends GraphqlTransportWsExecutionResult
    ? Input['response']
    : GraphqlTransportWsExecutionResult;

type GraphqlTransportWsFunction<Input extends GraphqlTransportWsRequestInput> = (
  params: GraphqlTransportWsParams
) => MaybePromise<GraphqlTransportWsInlineResponse<Input>>;

type GraphqlTransportWsConfig<Input extends GraphqlTransportWsRequestInput> =
  GraphqlTransportWsFunction<Input> | GraphqlTransportWsInlineResponse<Input>;

const resolveConfigType = <Input extends GraphQLRequestInput>(config: GraphQLConfig<Input>) => {
  if (typeof config === 'function' && isGeneratorFunction(config))
    return { type: 'generator' as const, config };

  if (typeof config === 'function') return { type: 'handler' as const, config };
  if (typeof config !== 'object' || config === null) return { type: 'data' as const, config };
  if (GRAPHQL_POLLING_CONFIG in config) return { type: 'polling' as const, config };

  return { type: 'data' as const, config };
};

const createConfigResolver = <Input extends GraphQLRequestInput>(
  config: GraphQLConfig<Input>,
  factorySettings: GraphQLFactorySettings = {}
): GraphQLRouteConfig => {
  const resolvedConfig = resolveConfigType(config);
  const { match: entities = {}, ...settings } = factorySettings;

  switch (resolvedConfig.type) {
    case 'data': {
      return {
        data: resolvedConfig.config,
        entities,
        settings
      };
    }

    case 'polling': {
      const polling = resolvedConfig.config.polling;
      const normalizedPolling = polling.map((item) => {
        if ('handler' in item) {
          return {
            data: item.handler,
            time: item.time
          };
        }

        if ('response' in item) {
          return {
            data: item.response,
            time: item.time
          };
        }

        throw new Error(`Unexpected polling item kind: ${JSON.stringify(item, null, 2)}`);
      });

      return {
        data: createPollingHandler(normalizedPolling),
        entities,
        settings
      };
    }

    case 'generator': {
      const config = resolvedConfig.config as GraphQLGeneratorFunction<Input>;
      const generator = createGenerator(config);

      return {
        data: generator,
        entities,
        settings
      };
    }

    case 'handler': {
      return {
        data: resolvedConfig.config,
        entities,
        settings
      };
    }

    default: {
      throw new Error(`Unexpected route config kind: ${JSON.stringify(config, null, 2)}`);
    }
  }
};

const createGraphQLFactory = <OperationType extends GraphQLOperationType>(
  operationType: OperationType
) => {
  function createRequestConfig<Input extends GraphQLRequestInput = GraphQLRequestInput>(
    identifier: GraphQLIdentifier,
    config: GraphQLConfig<Input>,
    settings?: GraphQLFactorySettings
  ): GraphQLRequestConfig {
    return {
      identifier,
      operationType,
      routes: [createConfigResolver(config, settings)]
    };
  }

  return createRequestConfig;
};

const resolveSubscriptionConfigType = <Input extends GraphqlTransportWsRequestInput>(
  config: GraphqlTransportWsConfig<Input>
) => {
  if (typeof config === 'function') return { type: 'handler' as const, config };

  return { type: 'data' as const, config };
};

const createSubscriptionRouteConfig = <Input extends GraphqlTransportWsRequestInput>(
  config: GraphqlTransportWsConfig<Input>,
  factorySettings: GraphqlTransportWsFactorySettings = {}
): GraphqlTransportWsRouteConfig => {
  const resolvedConfig = resolveSubscriptionConfigType(config);
  const { match: entities = {}, ...settings } = factorySettings;

  switch (resolvedConfig.type) {
    case 'data': {
      return {
        data: resolvedConfig.config,
        entities,
        settings
      };
    }

    case 'handler': {
      return {
        data: resolvedConfig.config,
        entities,
        settings
      };
    }

    default: {
      throw new Error(
        `Unexpected subscription route config kind: ${JSON.stringify(config, null, 2)}`
      );
    }
  }
};

const createGraphqlTransportWsFactory = () => {
  function createRequestConfig<
    Input extends GraphqlTransportWsRequestInput = GraphqlTransportWsRequestInput
  >(
    identifier: GraphQLIdentifier,
    config: GraphqlTransportWsConfig<Input>,
    settings?: GraphqlTransportWsFactorySettings
  ): GraphqlTransportWsRequestConfig {
    return {
      identifier,
      operationType: 'subscription',
      routes: [createSubscriptionRouteConfig(config, settings)]
    };
  }

  return createRequestConfig;
};

const polling = <Input extends GraphQLRequestInput = GraphQLRequestInput>(
  value: GraphQLPollingObject<Input>['polling']
): GraphQLPollingObject<Input> => ({
  [GRAPHQL_POLLING_CONFIG]: true,
  polling: value
});

export const graphql = {
  ...graphqlInterceptors,
  mutation: createGraphQLFactory('mutation'),
  polling,
  query: createGraphQLFactory('query'),
  subscription: createGraphqlTransportWsFactory()
};
