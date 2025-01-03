import type { IRouter } from 'express';
import { flatten } from 'flat';
import fs from 'fs';
import path from 'path';

import {
  asyncHandler,
  callRequestInterceptor,
  callResponseInterceptors,
  convertToEntityDescriptor,
  isEntityDescriptor,
  isFileDescriptorValid,
  isFilePathValid,
  resolveEntityValues,
  sleep
} from '@/utils/helpers';
import type {
  Entries,
  Interceptors,
  RestConfig,
  RestDataResponse,
  RestEntitiesByEntityName,
  RestEntity,
  RestFileResponse,
  TopLevelPlainEntityArray,
  TopLevelPlainEntityDescriptor
} from '@/utils/types';

import { prepareRestRequestConfigs } from './helpers';

interface CreateRestRoutesParams {
  router: IRouter;
  restConfig: RestConfig;
  serverResponseInterceptor?: Interceptors['response'];
}

export const createRestRoutes = ({
  router,
  restConfig,
  serverResponseInterceptor
}: CreateRestRoutesParams) => {
  prepareRestRequestConfigs(restConfig.configs).forEach((requestConfig) => {
    router.route(requestConfig.path)[requestConfig.method](
      asyncHandler(async (request, response, next) => {
        if (requestConfig.interceptors?.request) {
          await callRequestInterceptor({
            request,
            interceptor: requestConfig.interceptors.request
          });
        }

        const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
          if (!entities) return true;

          const entries = Object.entries(entities) as Entries<Required<RestEntitiesByEntityName>>;
          return entries.every(([entityName, entityDescriptorOrValue]) => {
            const { checkMode, value: descriptorValue } =
              convertToEntityDescriptor(entityDescriptorOrValue);

            // ✅ important:
            // check whole body as plain value strictly if descriptor used for body
            const isEntityBodyByTopLevelDescriptor =
              entityName === 'body' && isEntityDescriptor(entityDescriptorOrValue);
            if (isEntityBodyByTopLevelDescriptor) {
              // ✅ important:
              // bodyParser sets body to empty object if body not sent or invalid, so assume {} as undefined
              return resolveEntityValues(
                checkMode,
                Object.keys(request.body).length ? request.body : undefined,
                descriptorValue
              );
            }

            const isEntityBodyByTopLevelArray =
              entityName === 'body' && Array.isArray(entityDescriptorOrValue);
            if (isEntityBodyByTopLevelArray) {
              return entityDescriptorOrValue.some((entityDescriptorOrValueElement) =>
                // ✅ important:
                // bodyParser sets body to empty object if body not sent or invalid, so assume {} as undefined
                resolveEntityValues(
                  checkMode,
                  Object.keys(request.body).length ? request.body : undefined,
                  entityDescriptorOrValueElement
                )
              );
            }

            const recordOrArrayEntries = Object.entries(entityDescriptorOrValue) as Entries<
              Exclude<RestEntity, TopLevelPlainEntityDescriptor | TopLevelPlainEntityArray>
            >;
            return recordOrArrayEntries.every(([entityKey, mappedEntityDescriptor]) => {
              const { checkMode, value: descriptorValue } =
                convertToEntityDescriptor(mappedEntityDescriptor);
              const flattenEntity = flatten<any, any>(request[entityName]);
              // ✅ important: transform header keys to lower case because browsers send headers in lowercase
              return resolveEntityValues(
                checkMode,
                flattenEntity[entityName === 'headers' ? entityKey.toLowerCase() : entityKey],
                descriptorValue
              );
            });
          });
        });

        if (!matchedRouteConfig) {
          return next();
        }

        if (matchedRouteConfig.interceptors?.request) {
          await callRequestInterceptor({
            request,
            interceptor: matchedRouteConfig.interceptors.request
          });
        }

        const matchedRouteConfigDataDescriptor = {} as {
          data?: RestDataResponse;
          file?: RestFileResponse;
        };

        if (matchedRouteConfig.settings?.polling && 'queue' in matchedRouteConfig) {
          if (!matchedRouteConfig.queue.length) return next();

          const shallowMatchedRouteConfig =
            matchedRouteConfig as unknown as typeof matchedRouteConfig & {
              __pollingIndex: number;
              __timeoutInProgress: boolean;
            };

          let index = shallowMatchedRouteConfig.__pollingIndex ?? 0;
          const { time } = matchedRouteConfig.queue[index];

          const updateIndex = () => {
            if (matchedRouteConfig.queue.length - 1 === index) {
              index = 0;
            } else {
              index += 1;
            }
            shallowMatchedRouteConfig.__pollingIndex = index;
          };
          const queueItem = matchedRouteConfig.queue[index];

          if (time && !shallowMatchedRouteConfig.__timeoutInProgress) {
            shallowMatchedRouteConfig.__timeoutInProgress = true;
            setTimeout(() => {
              shallowMatchedRouteConfig.__timeoutInProgress = false;
              updateIndex();
            }, time);
          }

          if (!time && !shallowMatchedRouteConfig.__timeoutInProgress) {
            updateIndex();
          }

          if ('data' in queueItem) {
            matchedRouteConfigDataDescriptor.data = queueItem.data;
          }
          if ('file' in queueItem) {
            if (!isFilePathValid(queueItem.file)) return next();
            matchedRouteConfigDataDescriptor.file = queueItem.file;
          }
        }

        if ('data' in matchedRouteConfig) {
          matchedRouteConfigDataDescriptor.data = matchedRouteConfig.data;
        }
        if ('file' in matchedRouteConfig) {
          if (!isFilePathValid(matchedRouteConfig.file)) return next();
          matchedRouteConfigDataDescriptor.file = matchedRouteConfig.file;
        }

        if (matchedRouteConfig.settings?.status) {
          response.statusCode = matchedRouteConfig.settings.status;
        }

        // ✅ important:
        // set 'Cache-Control' header for explicit browsers response revalidate: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        // this code should place before response interceptors for giving opportunity to rewrite 'Cache-Control' header
        if (request.method === 'GET') response.set('Cache-control', 'no-cache');

        let resolvedData = null;

        if (matchedRouteConfigDataDescriptor.data) {
          resolvedData =
            typeof matchedRouteConfigDataDescriptor.data === 'function'
              ? await matchedRouteConfigDataDescriptor.data(
                  request,
                  matchedRouteConfig.entities ?? {}
                )
              : matchedRouteConfigDataDescriptor.data;
        }
        if (matchedRouteConfigDataDescriptor.file) {
          const buffer = fs.readFileSync(path.resolve(matchedRouteConfigDataDescriptor.file));
          resolvedData = {
            path: matchedRouteConfigDataDescriptor.file,
            file: buffer
          };
        }

        const data = await callResponseInterceptors({
          data: resolvedData,
          request,
          response,
          interceptors: {
            routeInterceptor: matchedRouteConfig.interceptors?.response,
            requestInterceptor: requestConfig.interceptors?.response,
            apiInterceptor: restConfig.interceptors?.response,
            serverInterceptor: serverResponseInterceptor
          }
        });

        if (matchedRouteConfig.settings?.delay) {
          await sleep(matchedRouteConfig.settings.delay);
        }

        if (matchedRouteConfigDataDescriptor.data) {
          return response.json(data);
        }
        if (matchedRouteConfigDataDescriptor.file) {
          if (!isFileDescriptorValid(data)) return next();
          const fileName = data.path.split('/').at(-1)!;
          const fileExtension = fileName.split('.').at(-1)!;
          response.type(fileExtension);
          response.set('Content-Disposition', `filename=${fileName}`);
          return response.send(data.file);
        }
      })
    );
  });

  return router;
};
