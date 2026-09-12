import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true
  },
  {
    name: 'mock-config-server/md',
    // ✅ important: markdown code blocks are linted as virtual files inside the md path
    files: ['**/*.md', '**/*.md/**'],
    rules: {
      'style/max-len': 'off',
      // ✅ important: readme snippets show config shape, not node import boilerplate
      'node/prefer-global/buffer': 'off'
    }
  },
  {
    name: 'mock-config-server/typescript',
    rules: {
      'node/prefer-global/process': 'off',
      'ts/no-namespace': 'off',
      'ts/no-empty-object-type': 'off'
    }
  },
  {
    name: 'mock-config-server/rewrites',
    rules: {
      'no-console': ['warn', { allow: ['info', 'dir', 'warn', 'error'] }]
    }
  }
);
