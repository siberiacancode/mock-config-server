import fs from 'fs';
import path from 'path';

import { createTmpDir } from '../../tests';

import { isFileDescriptorValid } from './isFileDescriptorValid';

describe('isFileDescriptorValid', () => {
  test('Should return true only for valid file descriptors', () => {
    const tmpDirPath = createTmpDir();

    const invalidFileDescriptors = [true, 123, [], {}, null, undefined];
    invalidFileDescriptors.forEach((invalidFileDescriptor) => {
      expect(isFileDescriptorValid(invalidFileDescriptor)).toBe(false);
    });

    const notExistedFilePath = path.join(tmpDirPath, './notExistedFile.json');
    const fileBuffer = Buffer.from('file', 'utf-8');

    const invalidPaths = [true, 123, '', notExistedFilePath, [], {}, null, undefined];
    invalidPaths.forEach((invalidPath) => {
      expect(isFileDescriptorValid({ path: invalidPath, file: fileBuffer })).toBe(false);
    });
    expect(isFileDescriptorValid({ file: fileBuffer })).toBe(false);

    const existedFilePath = path.join(tmpDirPath, './existedFile.json');

    const invalidFiles = [true, 123, '', [], {}, null, undefined];
    invalidFiles.forEach((invalidFile) => {
      expect(isFileDescriptorValid({ path: existedFilePath, file: invalidFile })).toBe(false);
    });
    expect(isFileDescriptorValid({ path: existedFilePath })).toBe(false);

    fs.writeFileSync(existedFilePath, JSON.stringify({ some: 'data' }));
    expect(isFileDescriptorValid({ path: existedFilePath, file: fileBuffer })).toBe(true);

    fs.rmSync(tmpDirPath, { recursive: true, force: true });
  });
});
