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
            files: ['**/*.tsx'],
            extends: '@pulsanova/react',
        },
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
    ],
};
