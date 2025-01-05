import { z } from 'zod';

import type { FileDescriptor } from '@/utils/types';

import { isFilePathValid } from '../isFilePathValid/isFilePathValid';

export const isFileDescriptorValid = (value: any): value is FileDescriptor =>
  z
    .object({
      path: z.string().refine(isFilePathValid),
      file: z.instanceof(Buffer)
    })
    .strict()
    .safeParse(value).success;
