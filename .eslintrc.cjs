module.exports = {
  env: {
    browser: true,
    es2015: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    '@typescript-eslint/consistent-type-imports': 'error',
    'object-curly-spacing': ['error', 'never'],
    'object-curly-newline': ['error', {
      'ImportDeclaration':  {
        'multiline': true,
        'minProperties': 3
      }
    }],
  }
}
