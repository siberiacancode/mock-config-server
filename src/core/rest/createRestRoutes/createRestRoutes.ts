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
  isFileDescriptor,
  isFilePathValid,
  resolveEntityValues,
  sleep
} from '@/utils/helpers';
import type {
  EntityDescriptor,
  Entries,
  Interceptors,
  PlainObject,
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
  serverResponseInterceptor?: Interceptors<'rest'>['response'];
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
            // ✅ important:
            // check whole body as plain value strictly if descriptor used for body
            const isEntityBodyByTopLevelDescriptor =
              entityName === 'body' && isEntityDescriptor(entityDescriptorOrValue);
            if (isEntityBodyByTopLevelDescriptor) {
              // ✅ important:
              // bodyParser sets body to empty object if body not sent or invalid, so assume {} as undefined
              const actualValue = Object.keys(request.body).length ? request.body : undefined;

              const bodyDescriptor: EntityDescriptor = entityDescriptorOrValue;
              if (
                bodyDescriptor.checkMode === 'exists' ||
                bodyDescriptor.checkMode === 'notExists'
              ) {
                return resolveEntityValues({
                  actualValue,
                  checkMode: bodyDescriptor.checkMode
                });
              }

              return resolveEntityValues({
                actualValue,
                descriptorValue: bodyDescriptor.value,
                checkMode: bodyDescriptor.checkMode,
                oneOf: bodyDescriptor.oneOf ?? false
              });
            }

            const isEntityBodyByTopLevelArray =
              entityName === 'body' && Array.isArray(entityDescriptorOrValue);
            if (isEntityBodyByTopLevelArray) {
              // ✅ important:
              // bodyParser sets body to empty object if body not sent or invalid, so assume {} as undefined
              const actualValue = Object.keys(request.body).length ? request.body : undefined;
              return resolveEntityValues({
                actualValue,
                descriptorValue: entityDescriptorOrValue,
                checkMode: 'equals'
              });
            }

            const recordOrArrayEntries = Object.entries(entityDescriptorOrValue) as Entries<
              Exclude<RestEntity, TopLevelPlainEntityDescriptor | TopLevelPlainEntityArray>
            >;
            return recordOrArrayEntries.every(([entityKey, mappedEntityDescriptorOrValue]) => {
              const entityDescriptor = convertToEntityDescriptor(mappedEntityDescriptorOrValue);
              const actualEntity = flatten<PlainObject, PlainObject>(request[entityName]);

              // ✅ important: transform header keys to lower case because browsers send headers in lowercase
              const actualKey = entityName === 'headers' ? entityKey.toLowerCase() : entityKey;
              const actualValue = actualEntity[actualKey];

              if (
                entityDescriptor.checkMode === 'exists' ||
                entityDescriptor.checkMode === 'notExists'
              ) {
                return resolveEntityValues({
                  actualValue,
                  checkMode: entityDescriptor.checkMode
                });
              }

              return resolveEntityValues({
                actualValue,
                descriptorValue: entityDescriptor.value,
                checkMode: entityDescriptor.checkMode,
                oneOf: entityDescriptor.oneOf ?? false
              });
            });
          });
        });

        if (!matchedRouteConfig) return next();

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

        if (isFileDescriptor(data)) {
          const isFilePathChanged = matchedRouteConfigDataDescriptor.file !== data.path;
          if (isFilePathChanged) {
            if (!isFilePathValid(data.path)) return next();
            data.file = fs.readFileSync(path.resolve(data.path));
          }
          const fileName = data.path.split('/').at(-1)!;
          const fileExtension = fileName.split('.').at(-1)!;
          response.type(fileExtension);
          response.set('Content-Disposition', `filename=${fileName}`);
          return response.send(data.file);
        }
        response.json(data);
      })
    );
  });

  return router;
};
