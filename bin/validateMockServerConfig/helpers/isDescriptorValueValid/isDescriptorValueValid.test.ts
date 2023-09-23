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
        expect(isDescriptorValueValid(checkActualValueCheckMode, validDescriptorValue, false)).toBe(
          true
        );

        invalidDescriptorValues.forEach((invalidDescriptorValue) => {
          expect(
            isDescriptorValueValid(checkActualValueCheckMode, invalidDescriptorValue, false)
          ).toBe(false);
        });
      });
    });

    test('Should be independent of isCheckAsObject argument', () => {
      const validDescriptorValue = undefined;
      const invalidDescriptorValue = true;

      CHECK_ACTUAL_VALUE_CHECK_MODES.forEach((checkActualValueCheckMode) => {
        expect(isDescriptorValueValid(checkActualValueCheckMode, validDescriptorValue, false)).toBe(
          true
        );
        expect(isDescriptorValueValid(checkActualValueCheckMode, validDescriptorValue, true)).toBe(
          true
        );

        expect(
          isDescriptorValueValid(checkActualValueCheckMode, invalidDescriptorValue, false)
        ).toBe(false);
        expect(isDescriptorValueValid(checkActualValueCheckMode, validDescriptorValue, true)).toBe(
          true
        );
      });
    });
  });

  describe('compareWithDescriptorAnyValue checkModes', () => {
    test('Should correctly validate descriptor value for mapped entity', () => {
      const validDescriptorValues = [true, 1, 'string', null];
      const invalidDescriptorValues = [undefined, {}, [], () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorValueCheckMode) => {
          validDescriptorValues.forEach((validDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                validDescriptorValue,
                false
              )
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                invalidDescriptorValue,
                false
              )
            ).toBe(false);
          });
        }
      );
    });

    test('Should correctly validate top level descriptor flatten value for plain entity', () => {
      const validDescriptorValues = [{}, []];
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorValueCheckMode) => {
          validDescriptorValues.forEach((validDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                validDescriptorValue,
                true
              )
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                invalidDescriptorValue,
                true
              )
            ).toBe(false);
          });
        }
      );
    });

    test('Should correctly validate property level descriptor flatten value for plain entity', () => {
      const validDescriptorValues = [true, 1, 'string', null];
      const invalidDescriptorValues = [{}, [], undefined, () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorValueCheckMode) => {
          validDescriptorValues.forEach((validDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                validDescriptorValue,
                false
              )
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                invalidDescriptorValue,
                false
              )
            ).toBe(false);
          });
        }
      );
    });

    test('Should correctly validate descriptor nested value for plain entity', () => {
      const validNestedDescriptorValues = [true, 1, 'string', null, {}, []];
      const invalidNestedDescriptorValues = [undefined, () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_ANY_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorValueCheckMode) => {
          validNestedDescriptorValues.forEach((validNestedDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                { key: validNestedDescriptorValue },
                true
              )
            ).toBe(true);
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                [validNestedDescriptorValue],
                true
              )
            ).toBe(true);
          });

          invalidNestedDescriptorValues.forEach((invalidNestedDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                { key: invalidNestedDescriptorValue },
                true
              )
            ).toBe(false);

            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                [invalidNestedDescriptorValue],
                true
              )
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
                validDescriptorValue,
                false
              )
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorStringValueCheckMode,
                invalidDescriptorValue,
                false
              )
            ).toBe(false);
          });
        }
      );
    });

    test('Should be independent of isCheckAsObject argument', () => {
      const validDescriptorValue = 'string';
      const invalidDescriptorValue = null;

      COMPARE_WITH_DESCRIPTOR_STRING_VALUE_CHECK_MODES.forEach(
        (compareWithDescriptorStringValueCheckMode) => {
          expect(
            isDescriptorValueValid(
              compareWithDescriptorStringValueCheckMode,
              validDescriptorValue,
              false
            )
          ).toBe(true);
          expect(
            isDescriptorValueValid(
              compareWithDescriptorStringValueCheckMode,
              validDescriptorValue,
              true
            )
          ).toBe(true);

          expect(
            isDescriptorValueValid(
              compareWithDescriptorStringValueCheckMode,
              invalidDescriptorValue,
              false
            )
          ).toBe(false);
          expect(
            isDescriptorValueValid(
              compareWithDescriptorStringValueCheckMode,
              invalidDescriptorValue,
              true
            )
          ).toBe(false);
        }
      );
    });
  });

  describe('function checkMode', () => {
    test('Should correctly validate descriptor value for function checkMode', () => {
      const validDescriptorValue = () => {};
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, {}, [], /\d/];

      expect(isDescriptorValueValid('function', validDescriptorValue, false)).toBe(true);

      invalidDescriptorValues.forEach((invalidDescriptorValue) => {
        expect(isDescriptorValueValid('function', invalidDescriptorValue, false)).toBe(false);
      });
    });

    test('Should be independent of isCheckAsObject argument', () => {
      const validDescriptorValue = () => {};
      const invalidDescriptorValue = true;

      expect(isDescriptorValueValid('function', validDescriptorValue, false)).toBe(true);
      expect(isDescriptorValueValid('function', validDescriptorValue, true)).toBe(true);

      expect(isDescriptorValueValid('function', invalidDescriptorValue, false)).toBe(false);
      expect(isDescriptorValueValid('function', invalidDescriptorValue, true)).toBe(false);
    });
  });

  describe('regExp checkMode', () => {
    test('Should correctly validate descriptor value for regExp checkMode', () => {
      const validDescriptorValue = /\d/;
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, {}, [], () => {}];

      expect(isDescriptorValueValid('regExp', validDescriptorValue, false)).toBe(true);

      invalidDescriptorValues.forEach((invalidDescriptorValue) => {
        expect(isDescriptorValueValid('regExp', invalidDescriptorValue, false)).toBe(false);
      });
    });

    test('Should be independent of isCheckAsObject argument', () => {
      const validDescriptorValue = /\d/;
      const invalidDescriptorValue = true;

      expect(isDescriptorValueValid('regExp', validDescriptorValue, false)).toBe(true);
      expect(isDescriptorValueValid('regExp', validDescriptorValue, true)).toBe(true);

      expect(isDescriptorValueValid('regExp', invalidDescriptorValue, false)).toBe(false);
      expect(isDescriptorValueValid('regExp', invalidDescriptorValue, true)).toBe(false);
    });
  });
});
