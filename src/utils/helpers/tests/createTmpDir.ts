import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const createTmpDir = () => fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
