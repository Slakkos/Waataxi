module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
  overrides: [
    {
      files: ['backend/**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      env: { node: true, es6: true },
    },
    {
      files: ['mobile/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],
      settings: { react: { version: 'detect' } },
      env: { es6: true, browser: true, node: true, jest: true },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};

