'use strict';

module.exports = {
    root: true,
    extends: '@pulsanova/node',
    rules: {
        'import/no-unresolved': ['off'],
    },
    overrides: [
        {
            files: ['**/index.d.ts'],
            extends: '@pulsanova/esnext',
            parserOptions: {
                project: '../tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
    ],
};
