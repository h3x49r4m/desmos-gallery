module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  },
  globals: {
    'ApiClient': 'readonly',
    'DataManager': 'readonly',
    'StorageManager': 'readonly',
    'SimpleStorage': 'readonly',
    'showToast': 'readonly',
    'showPage': 'readonly',
    'calculatorManager': 'readonly',
    'Desmos': 'readonly',
    'GraphCard': 'readonly',
    'HomePage': 'readonly',
    'GalleryPage': 'readonly',
    'SettingsPage': 'readonly',
    'desmosGallery': 'readonly',
    'MathJax': 'readonly'
  }
};