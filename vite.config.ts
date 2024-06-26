import { vitest } from '@siberiacancode/vitest';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    ...vitest,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@/tests': path.resolve(__dirname, './tests'),
      '@': path.resolve(__dirname, './src')
    }
  }
});
