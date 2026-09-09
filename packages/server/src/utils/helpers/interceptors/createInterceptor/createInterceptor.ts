import type { InterceptorName } from '@/utils/types';

import { INTERCEPTOR_NAME } from '@/utils/constants';

type BrandedInterceptor<Handler> = Handler & { [INTERCEPTOR_NAME]: InterceptorName };

export const createInterceptor = <Handler extends (...args: any[]) => any>(
  name: InterceptorName,
  interceptor: Handler
) => {
  const brandedInterceptor = interceptor as BrandedInterceptor<Handler>;
  brandedInterceptor[INTERCEPTOR_NAME] = name;
  return brandedInterceptor;
};
