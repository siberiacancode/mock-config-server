import type {
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorStringValueCheckMode,
  CompareWithDescriptorValueCheckMode
} from './checkModes';
import type { NestedObjectOrArray } from './utils';

/* ----- Plain entity ----- */

type PlainEntityValue = string | number | boolean | null;

export type TopLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (
          actualValue: NestedObjectOrArray<PlainEntityValue>,
          checkFunction: CheckFunction
        ) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: NestedObjectOrArray<PlainEntityValue>;
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
      }
    : never;

type PropertyLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (
          actualValue: PlainEntityValue | NestedObjectOrArray<PlainEntityValue>,
          checkFunction: CheckFunction
        ) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: PlainEntityValue | NestedObjectOrArray<PlainEntityValue>;
      }
    : Check extends CompareWithDescriptorStringValueCheckMode
    ? {
        checkMode: Check;
        value: PlainEntityValue | PlainEntityValue[];
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
      }
    : never;

type NonCheckMode<T extends object> = T & { checkMode?: never };

type TopLevelPlainEntityRecord = NonCheckMode<
  Record<
    string,
    | PropertyLevelPlainEntityDescriptor
    | NonCheckMode<NestedObjectOrArray<PlainEntityValue>>
    | PlainEntityValue
  >
>;

export type TopLevelPlainEntityArray = Array<NestedObjectOrArray<PlainEntityValue>>;

export type PlainEntity =
  | TopLevelPlainEntityDescriptor
  | TopLevelPlainEntityRecord
  | TopLevelPlainEntityArray;

/* ----- Mapped entity ----- */

type MappedEntityValue = string | number | boolean;

type MappedEntityDescriptor<Check extends CheckMode = CheckMode> = Check extends 'function'
  ? {
      checkMode: Check;
      value: (actualValue: MappedEntityValue, checkFunction: CheckFunction) => boolean;
    }
  : Check extends 'regExp'
  ? {
      checkMode: Check;
      value: RegExp | RegExp[];
    }
  : Check extends CompareWithDescriptorValueCheckMode
  ? {
      checkMode: Check;
      value: MappedEntityValue | MappedEntityValue[];
    }
  : Check extends CheckActualValueCheckMode
  ? {
      checkMode: Check;
    }
  : never;

export type MappedEntity = Record<
  string,
  MappedEntityDescriptor | MappedEntityValue | MappedEntityValue[]
>;
