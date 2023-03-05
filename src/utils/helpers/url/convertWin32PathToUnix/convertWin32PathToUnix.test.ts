import { convertWin32PathToUnix } from './convertWin32PathToUnix';

describe('convertWin32PathToUnix', () => {
  test('Should correctly convert Windows-like path to Unix-like', () => {
    expect(convertWin32PathToUnix('C:\\mock-config-server\\dist\\src\\static\\views'))
      .toEqual('C:/mock-config-server/dist/src/static/views');
  });
});
