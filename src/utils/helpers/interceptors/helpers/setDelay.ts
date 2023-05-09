import { sleep } from '../../sleep';

export const setDelay = async (delay: number) => {
  await sleep(delay === Infinity ? 100000 : delay);
};
