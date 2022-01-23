module.exports = {
    presets: [
        'vca-jsx',
        '@vue/babel-preset-app',
        '@babel/preset-typescript',
    ],
    overrides: [
        {
            include: './**/*.tsx',
            presets: [
                ['@vue/babel-preset-app', { jsx: false }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
            ],
        },
    ],
};
