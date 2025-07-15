/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  'root': true,
  'extends': [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
  ],
  'rules': {
    'semi': ['warn', 'always'],
    'vue/html-indent': ['warn', 2],
    'vue/html-closing-bracket-newline': ['warn', {
      'singleline': 'never',
      'multiline': 'always',
    }],
    'vue/max-attributes-per-line': ['warn', {
      'singleline': { 'max': 3 },
      'multiline': { 'max': 1 },
    }],
    'vue/attribute-hyphenation': ['warn', 'never'],
    'vue/component-name-in-template-casing': ['warn', 'PascalCase'],

    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-empty-function': ['warn', { 'allow': ['arrowFunctions'] }],

    // Stylistic rules
    'indent': ['warn', 2],
    'quotes': ['warn', 'single'],
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'never',
      'exports': 'never',
      'functions': 'never',
    }],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'space-before-blocks': ['warn', 'always'],
    'keyword-spacing': ['warn', { 'before': true, 'after': true }],
    'no-trailing-spaces': 'warn',
    'eol-last': 'warn',
    // 'no-unused-vars': 'warn',
    'no-var': 'warn',
    'one-var': ['warn', 'never'],
  },
};
