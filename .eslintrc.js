module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2020
  },
  plugins: [
    '@typescript-eslint',
    'jest',   
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:node/recommended',
    'prettier'
  ],
};
