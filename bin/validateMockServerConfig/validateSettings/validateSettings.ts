import { isPlainObject } from '@/utils/helpers';

const ALLOWED_SETTINGS = ['polling', 'delay', 'status'];

const validateSetting = (setting: unknown, settingName: string) => {
  if (settingName === 'polling' && typeof setting !== 'boolean') {
    throw new Error('polling');
  }

  if (settingName === 'delay' && typeof setting !== 'number') {
    throw new Error('delay');
  }

  if (
    settingName === 'status' &&
    (typeof setting !== 'number' || !(setting >= 200 && setting <= 599))
  ) {
    throw new Error('status');
  }
};

export const validateSettings = (settings: unknown) => {
  const isSettingsObject = isPlainObject(settings);
  if (isSettingsObject) {
    Object.keys(settings).forEach((settingName) => {
      const isSettingAllowed = ALLOWED_SETTINGS.includes(settingName as any);
      if (!isSettingAllowed) {
        throw new Error(`settings.${settingName}`);
      }

      try {
        validateSetting(settings[settingName], settingName);
      } catch (error: any) {
        throw new Error(`settings.${error.message}`);
      }
    });
    return;
  }

  if (typeof settings !== 'undefined') {
    throw new Error('settings');
  }
};
