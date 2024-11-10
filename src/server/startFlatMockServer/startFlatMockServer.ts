import color from 'ansi-colors';

import { destroyerMiddleware } from '@/core/middlewares';
import { DEFAULT } from '@/utils/constants';
import type { FlatMockServerComponent, FlatMockServerSettings } from '@/utils/types';

import { createFlatMockServer } from '../createFlatMockServer/createFlatMockServer';

export const startFlatMockServer = (
  option: FlatMockServerSettings | FlatMockServerComponent,
  ...flatMockServerComponents: FlatMockServerComponent[]
) => {
  const isFlatMockServerComponent = 'configs' in option;

  if (isFlatMockServerComponent) {
    flatMockServerComponents.unshift(option);
  }

  const flatMockServerSettings = isFlatMockServerComponent ? undefined : option;

  const mockServer = createFlatMockServer(flatMockServerSettings, flatMockServerComponents);
  const port = flatMockServerSettings?.port ?? DEFAULT.PORT;

  const server = mockServer.listen(port, () => {
    console.log(color.green(`🎉 Flat Mock Server is running at http://localhost:${port}`));
  });

  // ✅ important: add destroy method for closing keep-alive connections after server shutdown
  return destroyerMiddleware(server);
};
