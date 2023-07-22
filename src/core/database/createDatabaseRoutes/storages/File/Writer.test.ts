import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Writer } from './Writer';

describe('Writer', () => {
  let tmpDirPath: string;

  beforeEach(() => {
    tmpDirPath = fs.mkdtempSync(os.tmpdir());
  });

  afterEach(() => {
    fs.rmSync(tmpDirPath, { recursive: true, force: true });
  });

  test('Write asynchronously in file only last data (before Promise become fulfilled)', async () => {
    const fileName = './database.json';
    const writer = new Writer(path.join(tmpDirPath, fileName));

    const writePromises: Promise<void>[] = [];
    const writeOperationCount = 100;
    for (let i = 0; i <= writeOperationCount; i += 1) {
      writePromises.push(writer.write(JSON.stringify({ index: i })));
    }
    await Promise.all(writePromises);

    expect(JSON.parse(fs.readFileSync(path.join(tmpDirPath, fileName), 'utf-8'))).toStrictEqual({
      index: writeOperationCount
    });
  });

  test('Write in file only if writing is unlocked (first write and last write)', async () => {
    const writer = new Writer(path.join(tmpDirPath, './database.json'));
    const writeFileMock = jest.spyOn(fs.promises, 'writeFile');

    const writePromises: Promise<void>[] = [];
    const writeOperationCount = 100;
    for (let i = 0; i <= writeOperationCount; i += 1) {
      writePromises.push(writer.write(JSON.stringify({ index: i })));
    }
    await Promise.all(writePromises);

    expect(writeFileMock).toHaveBeenCalledTimes(2);
  });
});
