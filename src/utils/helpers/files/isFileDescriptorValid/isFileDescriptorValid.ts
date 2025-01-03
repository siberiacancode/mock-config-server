import type { FileDescriptor } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';
import { isFilePathValid } from '../isFilePathValid/isFilePathValid';

export const isFileDescriptorValid = (value: any): value is FileDescriptor =>
  isPlainObject(value) &&
  'path' in value &&
  typeof value.path === 'string' &&
  isFilePathValid(value.path) &&
  'file' in value &&
  Buffer.isBuffer(value.file);
