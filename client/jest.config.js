'use strict';

module.exports = {
    rootDir: __dirname,
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/**/{layouts,components,modals,pages}/**/index.js',
        '!src/**/themes/*/index.js',
        '!src/**/{globals,locale}/**/*',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: '<rootDir>/tests/coverage',
    coverageReporters: ['lcov', 'html', 'text-summary'],
    testMatch: [
        '<rootDir>/tests/specs/**/*.{js,ts,tsx}',
        '<rootDir>/src/**/__tests__/**/*.{js,ts,tsx}',
        '<rootDir>/src/**/?(*.)spec.{js,ts,tsx}',
    ],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['/node_modules/'],
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|cts|mjs|ts|cts|mts|tsx)$'],
    moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'tsx', 'mts', 'cts', 'json'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
    },
    transform: {
        '^.+\\.(js|mjs|cjs|jsx|ts|mts|cts|tsx)$': 'babel-jest',
        '^(?!.*\\.(js|mjs|cjs|ts|mts|cts|tsx|json)$)': 'jest-transform-stub',
    },
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
    resetMocks: true,
};
