import {
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES
} from '@/utils/constants';

import { isDescriptorValueValid } from './isDescriptorValueValid';

describe('isDescriptorValueValid', () => {
  test('Should throw error if invalid checkMode passed', () => {
    expect(() => isDescriptorValueValid('wrongCheckMode', 'string')).toThrow(
      Error('Invalid checkMode')
    );
  });

  describe('checkActualValue checkModes', () => {
    test('Should correctly validate descriptor value for ', () => {
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

  describe('compareWithDescriptorValue checkModes', () => {
    test('Should correctly validate descriptor value for mapped entity', () => {
      const validDescriptorValues = [true, 1, 'string'];
      const invalidDescriptorValues = [null, undefined, {}, [], () => {}, /\d/];

      COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES.forEach((compareWithDescriptorValueCheckMode) => {
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
      });
    });

    test('Should correctly validate descriptor value for plain entity', () => {
      const validDescriptorValues = [{}, []];
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, () => {}, /\d/];
      const plainEntityNames = ['body', 'variables'];

      plainEntityNames.forEach((plainEntityName) => {
        COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES.forEach((compareWithDescriptorValueCheckMode) => {
          validDescriptorValues.forEach((validDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                validDescriptorValue,
                plainEntityName
              )
            ).toBe(true);
          });

          invalidDescriptorValues.forEach((invalidDescriptorValue) => {
            expect(
              isDescriptorValueValid(
                compareWithDescriptorValueCheckMode,
                invalidDescriptorValue,
                plainEntityName
              )
            ).toBe(false);
          });
        });
      });
    });
  });

  describe('function checkMode', () => {
    test('Should correctly validate descriptor value for function checkMode', () => {
      const validDescriptorValue = () => {};
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, {}, [], /\d/];

      expect(isDescriptorValueValid('function', validDescriptorValue)).toBe(true);

      invalidDescriptorValues.forEach((invalidDescriptorValue) => {
        expect(isDescriptorValueValid('function', invalidDescriptorValue)).toBe(false);
      });
    });
  });

  describe('regExp checkMode', () => {
    test('Should correctly validate descriptor value for regExp checkMode', () => {
      const validDescriptorValue = /\d/;
      const invalidDescriptorValues = [true, 1, 'string', null, undefined, {}, [], () => {}];

      expect(isDescriptorValueValid('regExp', validDescriptorValue)).toBe(true);

      invalidDescriptorValues.forEach((invalidDescriptorValue) => {
        expect(isDescriptorValueValid('regExp', invalidDescriptorValue)).toBe(false);
      });
    });
  });
});
