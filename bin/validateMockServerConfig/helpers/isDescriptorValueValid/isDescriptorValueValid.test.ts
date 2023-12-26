import {
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES
} from '@/utils/constants';

import { isDescriptorValueValid } from './isDescriptorValueValid';

describe('isDescriptorValueValid', () => {
  describe('checkActualValue checkModes', () => {
    test('Should correctly validate descriptor value', () => {
      const validDescriptorValue = undefined;
      const invalidDescriptorValues = [true, 1, 'string', null, {}, [], () => {}, /\d/];

      CHECK_ACTUAL_VALUE_CHECK_MODES.forEach((checkActualValueCheckMode) => {
        expect(isDescriptorValueValid(checkActualValueCheckMode, validDescriptorValue)).toBe(true);

        invalidDescriptorValues.forEach((invalidDescriptorValue) => {
          expect(isDescriptorValueValid(checkActualValueCheckMode, invalidDescriptorValue)).toBe(
            false
          );
        });
      });
    });
  });

  describe('compareWithDescriptorAnyValue checkModes', () => {
    test('Should correctly validate descriptor value for primitives, non plain objects, non arrays', () => {
      const validDescriptorValues = [true, 1, 'string', null];
      const invalidDescriptorValues = [undefined, () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorValueCheckMode) => {
          validDescriptorValues.forEach((validDescriptorValue) => {
            expect(
              isDescriptorValueValid(compareWithDescriptorValueCheckMode, validDescriptorValue)
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(compareWithDescriptorValueCheckMode, invalidDescriptorValue)
            ).toBe(false);
          });
        }
      );
    });

    test('Should correctly validate descriptor value for plain objects, arrays', () => {
      const validNestedDescriptorValues = [true, 1, 'string', null, {}, []];
      const invalidNestedDescriptorValues = [undefined, () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorValueCheckMode) => {
          validNestedDescriptorValues.forEach((validNestedDescriptorValue) => {
            expect(
              isDescriptorValueValid(compareWithDescriptorValueCheckMode, {
                key: validNestedDescriptorValue
              })
            ).toBe(true);
            expect(
              isDescriptorValueValid(compareWithDescriptorValueCheckMode, [
                validNestedDescriptorValue
              ])
            ).toBe(true);
          });

          invalidNestedDescriptorValues.forEach((invalidNestedDescriptorValue) => {
            expect(
              isDescriptorValueValid(compareWithDescriptorValueCheckMode, {
                key: invalidNestedDescriptorValue
              })
            ).toBe(false);

            expect(
              isDescriptorValueValid(compareWithDescriptorValueCheckMode, [
                invalidNestedDescriptorValue
              ])
            ).toBe(false);
          });
        }
      );
    });
  });

  describe('compareWithDescriptorStringValue checkModes', () => {
    test('Should correctly validate descriptor value', () => {
      const validDescriptorValues = [true, 1, 'string'];
      const invalidDescriptorValues = [null, undefined, {}, [], () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorStringValueCheckMode) => {
          validDescriptorValues.forEach((validDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorStringValueCheckMode,
                validDescriptorValue
              )
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorStringValueCheckMode,
                invalidDescriptorValue
              )
            ).toBe(false);
          });
        }
      );
    });
  });

  describe('function checkMode', () => {
    test('Should correctly validate descriptor value', () => {
      const validDescriptorValue = () => {};
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, {}, [], /\d/];

      expect(isDescriptorValueValid('function', validDescriptorValue)).toBe(true);

      invalidDescriptorValues.forEach((invalidDescriptorValue) => {
        expect(isDescriptorValueValid('function', invalidDescriptorValue)).toBe(false);
      });
    });
  });

  describe('regExp checkMode', () => {
    test('Should correctly validate descriptor value', () => {
      const validDescriptorValue = /\d/;
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, {}, [], () => {}];

      expect(isDescriptorValueValid('regExp', validDescriptorValue)).toBe(true);

      invalidDescriptorValues.forEach((invalidDescriptorValue) => {
        expect(isDescriptorValueValid('regExp', invalidDescriptorValue)).toBe(false);
      });
    });
  });
});
