'use strict';

module.exports = {
    extends: '@pulsanova/vue',

    // - Globals
    globals: {
        require: 'readonly',
        process: 'readonly',
    },

    // - Parseur
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        babelOptions: {
            configFile: require.resolve('./babel.config.js'),
        },
    },

    // - Configuration
    settings: {
        'import/resolver': {
            webpack: {
                config: require.resolve('@vue/cli-service/webpack.config.js'),
            },
        },
    },

    // - Overrides
    overrides: [
        {
            files: ['**/locale/**/*'],
            rules: {
                '@stylistic/js/quotes': ['off'],
                '@stylistic/ts/quotes': ['off'],
                'global-require': ['off'],
            },
        },
        {
            files: ['**/*.d.ts'],
            rules: {
                '@typescript-eslint/no-unused-vars': ['off'],
            },
        },
        {
            files: [
                '**/tests/**/*',
                '**/__tests__/*',
                '**/*.spec.*',
            ],
            env: { jest: true },
            settings: {
                'import/resolver': {
                    'eslint-import-resolver-custom-alias': {
                        alias: {
                            '@fixtures': './tests/fixtures/',
                        },
                        extensions: [
                            '.mjs',
                            '.cjs',
                            '.js',
                            '.jsx',
                            '.ts',
                            '.tsx',
                            '.d.ts',
                            '.json',
                        ],
                    },
                },
            },
            rules: {
                'import/order': ['off'],
            },
        },
        {
            files: [
                '**/jest.config.js',
                '**/babel.config.js',
                '**/eslint.config.js',
                '**/postcss.config.js',
                '**/vue.config.js',
                '**/.eslintrc.js',
            ],
            extends: '@pulsanova/node',
        },
        // - Autorise les imports cycliques dans les stores / fixtures (schemas Zod).
        {
            files: [
                '**/stores/api/*',
                '**/stores/api/**/*',
                '**/tests/fixtures/**/*',
            ],
            rules: {
                'import/no-cycle': ['off'],
            },
        },
        // - Autorise le `snake_case` dans les types d'API vu que pour le moment
        //   celle-ci accepte et retourne uniquement sous ce format.
        {
            files: [
                '**/stores/api/*.ts',
                '**/stores/api/**/*.ts',
                '**/tests/fixtures/**/*.ts',
            ],
            rules: {
                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        selector: 'enumMember',
                        format: ['UPPER_CASE'],
                    },
                    {
                        selector: ['typeProperty', 'typeMethod'],
                        format: ['camelCase', 'snake_case'],
                        leadingUnderscore: 'allow',
                        filter: {
                            // - Ignore les propriétés / méthodes de type "gettext" (= `__`).
                            regex: '^__$',
                            match: false,
                        },
                    },
                    {
                        selector: 'typeLike',
                        format: ['PascalCase'],
                    },
                ],
            },
        },
    ],
};
