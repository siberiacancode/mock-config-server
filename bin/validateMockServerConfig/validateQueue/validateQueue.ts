import { isPlainObject } from '@/utils/helpers';

export const validateQueue = (queue: unknown) => {
  const isQueueArray = Array.isArray(queue);

  if (!isQueueArray) {
    throw new Error('queue');
  }

  queue.forEach((queueElement, index) => {
    const isQueueElementObject = isPlainObject(queueElement);
    if (isQueueElementObject) {
      const isQueueElementDataProperty = 'data' in queueElement;
      if (!isQueueElementDataProperty) {
        throw new Error(`queue[${index}].data`);
      }

      const isQueueElementTimeProperty = 'time' in queueElement;
      if (isQueueElementTimeProperty && typeof queueElement.time !== 'number') {
        throw new Error(`queue[${index}].time`);
      }

      return;
    }

    throw new Error(`queue[${index}]`);
  });
};
