import { isPlainObject } from '../../isPlainObject/isPlainObject';

export const isEntityDescriptor = (value: any) => isPlainObject(value) && 'checkMode' in value;
