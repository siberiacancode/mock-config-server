import { convertWin32PathToUnix } from './convertWin32PathToUnix';

describe('convertWin32PathToUnix', () => {
  test('Should correctly convert Windows-like path to Unix-like', () => {
    expect(convertWin32PathToUnix('C:\\mock-config-server\\dist\\src\\static\\views')).toEqual(
      'C:/mock-config-server/dist/src/static/views'
    );
  });

  test('Should correctly convert long Windows-like path to Unix-like', () => {
    expect(convertWin32PathToUnix('\\\\?\\mock-config-server\\dist\\src\\static\\views')).toEqual(
      'mock-config-server/dist/src/static/views'
    );
  });

  test('Should correctly convert Windows-like path with double backslashes to Unix-like', () => {
    expect(convertWin32PathToUnix('C:\\\\mock-config-server\\dist\\src\\static\\views')).toEqual(
      'C:/mock-config-server/dist/src/static/views'
    );
  });
});
