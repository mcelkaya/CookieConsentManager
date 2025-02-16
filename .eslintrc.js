// .eslintrc.js
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
  plugins: [
    'security',
    'xss',
    '@typescript-eslint'  // Added for additional rules
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // XSS prevention with exceptions for DOMPurify
    'xss/no-mixed-html': ['error', {
      'htmlVariableRules': ['Html$', 'HTML$'],
      'htmlFunctionRules': ['^sanitize'],
      'functions': {
        'sanitizeHTML': {
          'htmlInput': true,
          'safe': true
        },
        'DOMPurify.sanitize': {
          'htmlInput': true,
          'safe': true
        }
      }
    }],

    // Security plugin rules with refined exceptions
    'security/detect-object-injection': ['error', {
      'exceptionsStrings': ['querySelector', 'getElementById'],
      'exceptionsFiles': ['**/test/**'],
      'safeObjectExpressions': [
        'Object.prototype.hasOwnProperty.call',
        'Object.keys',
        'Object.values',
        'Object.entries'
      ]
    }],

    // Additional security and code quality rules
    'complexity': ['error', {
      'max': 15
    }],
    'no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'ignoreRestSiblings': true,
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    'prefer-const': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        'security/detect-object-injection': 'off',
        'xss/no-mixed-html': 'off'
      }
    }
  ],
  settings: {
    security: {
      'detect-object-injection': {
        safeObjectExpressions: [
          'Object.prototype.hasOwnProperty.call',
          'Object.keys',
          'Object.values',
          'Object.entries'
        ]
      }
    }
  }
};