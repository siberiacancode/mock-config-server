import fs from 'fs';
import os from 'os';
import path from 'path';

import { FileWriter } from './FileWriter';

describe('FileWriter', () => {
  let tmpDirPath: string;

  beforeEach(() => {
    tmpDirPath = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  });

  afterEach(() => {
    fs.rmSync(tmpDirPath, { recursive: true, force: true });
    jest.clearAllMocks();
  });

  test('Write asynchronously in file only last data (before Promise become fulfilled)', async () => {
    const fileName = './database.json';
    const filePath = path.join(tmpDirPath, fileName);
    const fileWriter = new FileWriter(filePath);

    const writePromises: Promise<void>[] = [];
    const writeOperationCount = 100;
    for (let i = 0; i <= writeOperationCount; i += 1) {
      writePromises.push(fileWriter.write(JSON.stringify({ index: i })));
    }
    await Promise.all(writePromises);

    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(fileData).toStrictEqual({ index: writeOperationCount });
  });

  test('Write in file only if writing is unlocked (first write and last write)', async () => {
    const fileWriter = new FileWriter(path.join(tmpDirPath, './database.json'));
    const fsPromisesWriteFileMock = jest.spyOn(fs.promises, 'writeFile');

    const writePromises: Promise<void>[] = [];
    const writeOperationCount = 100;
    for (let i = 0; i <= writeOperationCount; i += 1) {
      writePromises.push(fileWriter.write(JSON.stringify({ index: i })));
    }
    await Promise.all(writePromises);

    expect(fsPromisesWriteFileMock).toHaveBeenCalledTimes(2);
  });
});
