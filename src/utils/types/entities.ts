import type {
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorStringValueCheckMode,
  CompareWithDescriptorValueCheckMode,
  EntityDescriptor
} from './checkModes';
import type { NestedObjectOrArray } from './utils';

/* ----- Plain entity ----- */

type PlainEntityPrimitiveValue = string | number | boolean | null;
type PlainEntityObjectiveValue = NestedObjectOrArray<PlainEntityPrimitiveValue>;

export type TopLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? EntityDescriptor<
        Check,
        (actualValue: PlainEntityObjectiveValue, checkFunction: CheckFunction) => boolean
      >
    : Check extends CompareWithDescriptorAnyValueCheckMode
      ? EntityDescriptor<Check, PlainEntityObjectiveValue>
      : Check extends CheckActualValueCheckMode
        ? EntityDescriptor<Check, undefined>
        : never;

type PropertyLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? EntityDescriptor<
        Check,
        (
          actualValue: PlainEntityPrimitiveValue | PlainEntityObjectiveValue,
          checkFunction: CheckFunction
        ) => boolean
      >
    : Check extends 'regExp'
      ? EntityDescriptor<Check, RegExp>
      : Check extends CompareWithDescriptorAnyValueCheckMode
        ? EntityDescriptor<Check, PlainEntityPrimitiveValue | PlainEntityObjectiveValue>
        : Check extends CompareWithDescriptorStringValueCheckMode
          ? EntityDescriptor<Check, PlainEntityPrimitiveValue>
          : Check extends CheckActualValueCheckMode
            ? EntityDescriptor<Check, undefined>
            : never;

type NonCheckMode<T extends object> = T & { checkMode?: never };

type TopLevelPlainEntityRecord = NonCheckMode<
  Record<
    string,
    | PropertyLevelPlainEntityDescriptor
    | NonCheckMode<PlainEntityObjectiveValue>
    | PlainEntityPrimitiveValue
  >
>;

export type TopLevelPlainEntityArray = Array<PlainEntityPrimitiveValue | PlainEntityObjectiveValue>;

export type PlainEntity =
  | TopLevelPlainEntityDescriptor
  | TopLevelPlainEntityRecord
  | TopLevelPlainEntityArray;

/* ----- Mapped entity ----- */

type MappedEntityValue = string | number | boolean;

type MappedEntityDescriptor<Check extends CheckMode = CheckMode> = Check extends 'function'
  ? EntityDescriptor<
      Check,
      (actualValue: MappedEntityValue, checkFunction: CheckFunction) => boolean
    >
  : Check extends 'regExp'
    ? EntityDescriptor<Check, RegExp>
    : Check extends CompareWithDescriptorValueCheckMode
      ? EntityDescriptor<Check, MappedEntityValue>
      : Check extends CheckActualValueCheckMode
        ? EntityDescriptor<Check, undefined>
        : never;

export type MappedEntity = Record<string, MappedEntityDescriptor | MappedEntityValue>;
