import type { IRouter } from 'express';
import { flatten } from 'flat';
import path from 'path';

import {
  asyncHandler,
  callRequestInterceptor,
  callResponseInterceptors,
  convertToEntityDescriptor,
  getObjectPropByFlattenKey,
  isEntityDescriptor,
  isFilePathValid,
  isPlainObject,
  resolveEntityValues,
  sleep
} from '@/utils/helpers';
import type { Entries, Interceptors, RestConfig, RestEntitiesByEntityName } from '@/utils/types';

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
        const requestInterceptor = requestConfig.interceptors?.request;
        if (requestInterceptor) {
          await callRequestInterceptor({ request, interceptor: requestInterceptor });
        }

        const matchedRouteConfig = requestConfig.routes.find(({ entities }) => {
          if (!entities) return true;

          const entries = Object.entries(entities) as Entries<Required<RestEntitiesByEntityName>>;
          return entries.every(([entityName, entityDescriptorOrValue]) => {
            const { checkMode, value: descriptorValue } =
              convertToEntityDescriptor(entityDescriptorOrValue);

            if (entityName === 'body') {
              const plainEntity = entityDescriptorOrValue;
              // ✅ important:
              // bodyParser sets body to empty object if body not sent or invalid, so assume {} as undefined
              const actualBody = Object.keys(request.body).length ? request.body : undefined;

              // ✅ important:
              // check whole actual body as plain value strictly if descriptor used on top level
              const isPlainEntityByTopLevelDescriptor = isEntityDescriptor(plainEntity);
              if (isPlainEntityByTopLevelDescriptor) {
                console.log('isPlainEntityByTopLevelDescriptor');
                return resolveEntityValues(checkMode, actualBody, descriptorValue);
              }

              // ✅ important:
              // check keys if flatten style body used
              const isPlainEntityHaveFlattenStyle =
                (Array.isArray(plainEntity) || isPlainObject(plainEntity)) &&
                Object.entries(plainEntity).some(
                  ([key, value]) => key.includes('.') || isEntityDescriptor(value)
                );
              if (isPlainEntityHaveFlattenStyle) {
                console.log('isPlainEntityHaveFlattenStyle');
                return Object.entries(entityDescriptorOrValue).every(([key, descriptorOrValue]) => {
                  const actualBodyPart = getObjectPropByFlattenKey(request.body, key);
                  const { checkMode, value: descriptorValue } =
                    convertToEntityDescriptor(descriptorOrValue);
                  return resolveEntityValues(checkMode, actualBodyPart, descriptorValue);
                });
              }

              // ✅ important:
              // check actual body by oneOf logic if top level array used
              const isPlainEntityByTopLevelArray = Array.isArray(plainEntity);
              if (isPlainEntityByTopLevelArray) {
                console.log('isEntityBodyByTopLevelArray');
                return plainEntity.some((plainEntityElement) =>
                  resolveEntityValues(checkMode, actualBody, plainEntityElement)
                );
              }

              // ✅ important:
              // check actual body by partial logic if plain object used
              console.log('isEntityBodyPlainObject');

              const flattenPlainEntity = flatten<any, any>(plainEntity);
              const flattenPlainEntityKeys = Object.keys(flattenPlainEntity);

              const flattenActualBody = flatten<any, any>(request[entityName]);

              return flattenPlainEntityKeys.every((flattenPlainEntityKey) => {
                const descriptorValue = flattenPlainEntity[flattenPlainEntityKey];
                const actualValue = flattenActualBody[flattenPlainEntityKey];

                return resolveEntityValues('equals', actualValue, descriptorValue);
              });
            }

            const mappedEntity = entityDescriptorOrValue;
            const mappedEntityKeys = Object.keys(mappedEntity);
            return mappedEntityKeys.every((mappedEntityKey) => {
              const mappedEntityValueOrDescriptor = mappedEntity[mappedEntityKey];
              const { checkMode, value: descriptorValue } = convertToEntityDescriptor(
                mappedEntityValueOrDescriptor
              );
              // ✅ important: transform header keys to lower case because browsers send headers in lowercase
              const entityKey =
                entityName === 'headers' ? mappedEntityKey.toLowerCase() : mappedEntityKey;
              const actualValue = request[entityName][entityKey];
              return resolveEntityValues(checkMode, actualValue, descriptorValue);
            });
          });
        });

        if (!matchedRouteConfig) {
          return next();
        }

        let matchedRouteConfigData = null;
        if (matchedRouteConfig.settings?.polling && 'queue' in matchedRouteConfig) {
          if (!matchedRouteConfig.queue.length) return next();

          const shallowMatchedRouteConfig =
            matchedRouteConfig as unknown as typeof matchedRouteConfig & {
              __pollingIndex: number;
              __timeoutInProgress: boolean;
            };

          let index = shallowMatchedRouteConfig.__pollingIndex ?? 0;

          const { time, data } = matchedRouteConfig.queue[index];

          const updateIndex = () => {
            if (matchedRouteConfig.queue.length - 1 === index) {
              index = 0;
            } else {
              index += 1;
            }
            shallowMatchedRouteConfig.__pollingIndex = index;
          };

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

          matchedRouteConfigData = data;
        }

        if ('data' in matchedRouteConfig) {
          matchedRouteConfigData = matchedRouteConfig.data;
        }

        if ('file' in matchedRouteConfig) {
          if (!isFilePathValid(matchedRouteConfig.file)) return next();
        }

        const resolvedData =
          typeof matchedRouteConfigData === 'function'
            ? await matchedRouteConfigData(request, matchedRouteConfig.entities ?? {})
            : matchedRouteConfigData;

        if (matchedRouteConfig.settings?.status) {
          response.statusCode = matchedRouteConfig.settings.status;
        }

        // ✅ important:
        // set 'Cache-Control' header for explicit browsers response revalidate: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        // this code should place before response interceptors for giving opportunity to rewrite 'Cache-Control' header
        if (request.method === 'GET') response.set('Cache-control', 'no-cache');

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

        if ('file' in matchedRouteConfig) {
          return response.sendFile(path.resolve(matchedRouteConfig.file));
        }
        return response.json(data);
      })
    );
  });

  return router;
};
