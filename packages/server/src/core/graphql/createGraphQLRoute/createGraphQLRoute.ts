import type { Express } from 'express';

import type {
  GraphQLOperationType,
  GraphQLParams,
  GraphQLRequestArtifact,
  Interceptor
} from '@/utils/types';

import {
  asyncHandler,
  callHttpRequestInterceptors,
  callHttpResponseInterceptors,
  getGraphQLInput,
  normalizeUrl,
  parseGraphQLQuery,
  sleep
} from '@/utils/helpers';

import { isGraphQLRequestMatchedByEntities, matchGraphQLRequestArtifacts } from './helpers';

interface CreateGraphQLRouteParams {
  graphQLRequestArtifacts: GraphQLRequestArtifact[];
  server: Express;
  serverInterceptors?: Interceptor[];
}

export const createGraphQLRoute = ({
  server,
  graphQLRequestArtifacts,
  serverInterceptors = []
}: CreateGraphQLRouteParams) =>
  server.use(
    asyncHandler(async (request, response, next) => {
      if (request.method !== 'GET' && request.method !== 'POST') return next();

      const graphQLInput = getGraphQLInput(request);
      if (!graphQLInput.query) return next();

      const query = parseGraphQLQuery(graphQLInput.query);
      if (!query) return next();

      await callHttpRequestInterceptors(
        {
          request,
          meta: { type: 'graphql', operationType: query.operationType as GraphQLOperationType }
        },
        serverInterceptors
      );

      const matchedRequestArtifacts = matchGraphQLRequestArtifacts({
        artifacts: graphQLRequestArtifacts,
        meta: {
          path: normalizeUrl(request.path),
          query: graphQLInput.query,
          eventName: query.eventName,
          operationType: query.operationType,
          operationName: query.operationName
        }
      });

      if (!matchedRequestArtifacts.length) return next();

      const matchedRouteConfig = matchedRequestArtifacts.find(({ config }) =>
        isGraphQLRequestMatchedByEntities(
          { request, variables: graphQLInput.variables },
          config.entities
        )
      );

      if (!matchedRouteConfig) return next();

      await callHttpRequestInterceptors(
        {
          request,
          meta: { type: 'graphql', operationType: query.operationType as GraphQLOperationType }
        },
        matchedRouteConfig.componentInterceptors ?? []
      );
      const params: GraphQLParams = {
        request,
        response,
        next,
        entities: matchedRouteConfig.config.entities ?? {},
        broadcast: (payload) => {
          request.context.broadcast(payload);
        },
        appendHeader: (field, value) => {
          response.append(field, value);
        },
        attachment: (filename) => {
          response.attachment(filename);
        },
        clearCookie: (name, options) => {
          response.clearCookie(name, options);
        },
        getCookie: (name) => request.cookies[name],
        getRequestHeader: (field) => request.headers[field],
        getRequestHeaders: () => request.headers,
        getResponseHeader: (field) => response.getHeader(field),
        getResponseHeaders: () => response.getHeaders(),
        setCookie: (name, value, options) => {
          if (options) {
            response.cookie(name, value, options);
            return;
          }
          response.cookie(name, value);
        },
        setDelay: async (delay) => {
          await sleep(delay);
        },
        setHeader: (field, value) => {
          response.set(field, value);
        },
        setStatusCode: (statusCode) => {
          response.statusCode = statusCode;
        }
      };

      const resolvedData =
        typeof matchedRouteConfig.config.data === 'function'
          ? await matchedRouteConfig.config.data(params)
          : matchedRouteConfig.config.data;

      if (response.headersSent) {
        return;
      }

      if (matchedRouteConfig.config.settings?.status) {
        response.statusCode = matchedRouteConfig.config.settings.status;
      }

      if (matchedRouteConfig.operationType === 'query') {
        response.set('Cache-control', 'no-cache');
      }

      const data = await callHttpResponseInterceptors(
        {
          data: resolvedData,
          meta: { type: 'graphql', operationType: query.operationType as GraphQLOperationType },
          request,
          response
        },
        {
          componentInterceptors: matchedRouteConfig.componentInterceptors,
          serverInterceptors
        }
      );

      if (matchedRouteConfig.config.settings?.delay) {
        await sleep(matchedRouteConfig.config.settings.delay);
      }

      if (response.headersSent) {
        return;
      }

      return response.json(data);
    })
  );
