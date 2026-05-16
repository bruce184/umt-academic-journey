// eslint.config.js  (nằm ở root)
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // khai báo các global của Node: process, __dirname, ...
      },
    },
    rules: {
      // thêm rules nếu bạn muốn
    },
  },
];
