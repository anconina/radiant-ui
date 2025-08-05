module.exports = {
  extends: ['./.eslintrc.cjs'],
  plugins: ['import', 'boundaries'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    // Define boundaries for FSD layers
    'boundaries/elements': [
      {
        type: 'app',
        pattern: 'src/app/*',
      },
      {
        type: 'pages',
        pattern: 'src/pages/*',
      },
      {
        type: 'widgets',
        pattern: 'src/widgets/*',
      },
      {
        type: 'features',
        pattern: 'src/features/*',
      },
      {
        type: 'entities',
        pattern: 'src/entities/*',
      },
      {
        type: 'shared',
        pattern: 'src/shared/*',
      },
    ],
  },
  rules: {
    // Import order rules
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/app/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/pages/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/widgets/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/features/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/entities/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/shared/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // FSD layer boundaries
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'app',
            allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
          },
          {
            from: 'pages',
            allow: ['widgets', 'features', 'entities', 'shared'],
          },
          {
            from: 'widgets',
            allow: ['features', 'entities', 'shared'],
          },
          {
            from: 'features',
            allow: ['entities', 'shared'],
          },
          {
            from: 'entities',
            allow: ['shared'],
          },
          {
            from: 'shared',
            allow: ['shared'],
          },
        ],
      },
    ],

    // Prevent direct imports bypassing public API
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['*/features/*/*', '!*/features/*/index'],
            message: 'Please import from feature index file',
          },
          {
            group: ['*/entities/*/*', '!*/entities/*/index'],
            message: 'Please import from entity index file',
          },
          {
            group: ['*/widgets/*/*', '!*/widgets/*/index'],
            message: 'Please import from widget index file',
          },
        ],
      },
    ],
  },
}
