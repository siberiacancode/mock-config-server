import { isPlainObject } from '@/utils/helpers';

const ALLOWED_SETTINGS = ['polling'];

const validateSetting = (setting: unknown, settingName: string) => {
  if (settingName === 'polling' && typeof setting !== 'boolean') {
    throw new Error('polling');
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
