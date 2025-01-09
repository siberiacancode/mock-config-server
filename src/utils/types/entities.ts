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

export type EntityFunctionDescriptorValue<ActualValue> = (
  actualValue: ActualValue,
  checkFunction: CheckFunction
) => boolean;

export type TopLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? EntityDescriptor<Check, EntityFunctionDescriptorValue<PlainEntityObjectiveValue>>
    : Check extends CompareWithDescriptorAnyValueCheckMode
      ? EntityDescriptor<Check, PlainEntityObjectiveValue>
      : Check extends CheckActualValueCheckMode
        ? EntityDescriptor<Check>
        : never;

type PropertyLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? EntityDescriptor<
        Check,
        EntityFunctionDescriptorValue<PlainEntityPrimitiveValue | PlainEntityObjectiveValue>
      >
    : Check extends 'regExp'
      ? EntityDescriptor<Check, RegExp>
      : Check extends CompareWithDescriptorAnyValueCheckMode
        ? EntityDescriptor<Check, PlainEntityPrimitiveValue | PlainEntityObjectiveValue>
        : Check extends CompareWithDescriptorStringValueCheckMode
          ? EntityDescriptor<Check, PlainEntityPrimitiveValue>
          : Check extends CheckActualValueCheckMode
            ? EntityDescriptor<Check>
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

export type BodyPlainEntity =
  | TopLevelPlainEntityDescriptor
  | TopLevelPlainEntityRecord
  | TopLevelPlainEntityArray;

export type VariablesPlainEntity = TopLevelPlainEntityDescriptor | TopLevelPlainEntityRecord;

/* ----- Mapped entity ----- */

type MappedEntityValue = string | number | boolean;

type MappedEntityDescriptor<Check extends CheckMode = CheckMode> = Check extends 'function'
  ? EntityDescriptor<Check, EntityFunctionDescriptorValue<MappedEntityValue>>
  : Check extends 'regExp'
    ? EntityDescriptor<Check, RegExp>
    : Check extends CompareWithDescriptorValueCheckMode
      ? EntityDescriptor<Check, MappedEntityValue>
      : Check extends CheckActualValueCheckMode
        ? EntityDescriptor<Check>
        : never;

export type MappedEntity = Record<string, MappedEntityDescriptor | MappedEntityValue>;
