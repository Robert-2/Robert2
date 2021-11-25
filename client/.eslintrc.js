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
};
