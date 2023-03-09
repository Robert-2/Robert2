/* eslint-disable strict */

'use strict';

module.exports = {
    extends: '@pulsanova/vue',

    // - Parseur
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        babelOptions: {
            configFile: './babel.config.js',
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
                'quotes': ['off'],
                'global-require': ['off'],
            },
        },
        {
            files: ['**/tests/**/*', '**/__tests__/*'],
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
        // - Autorise le `snake_case` dans les types d'API vu que pour le moment
        //   celle-ci accepte et retourne uniquement sous ce format.
        {
            files: ['**/stores/api/*.ts', '**/stores/api/**/*.ts'],
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
