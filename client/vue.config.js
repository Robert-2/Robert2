const fs = require('fs');

const THEMES_PATH = './src/themes';
const DEV_CLIENT_URL = new URL('http://0.0.0.0:8081');

const themes = fs.readdirSync(THEMES_PATH, { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((dir) => dir.name);

const config = {
    pages: Object.fromEntries(themes.map(
        (theme) => [theme, {
            entry: `${THEMES_PATH}/${theme}/index.js`,
            chunks: ['chunk-vendors', 'index'],
        }],
    )),
    publicPath: '/webclient/',
    runtimeCompiler: true,
    lintOnSave: false,
    productionSourceMap: false,
    filenameHashing: false,
    chainWebpack: (webpackConfig) => {
        webpackConfig.plugins.delete('fork-ts-checker');

        themes.forEach((theme) => {
            webpackConfig.plugins.delete(`html-${theme}`);
            webpackConfig.plugins.delete(`preload-${theme}`);
            webpackConfig.plugins.delete(`prefetch-${theme}`);
        });

        if (process.env.NODE_ENV === 'production') {
            webpackConfig.plugins.delete('friendly-errors');
        }

        // - Si un `index.vue` existe dans un dossier, il doit être chargé en priorité.
        webpackConfig.resolve.extensions.prepend('.vue');
    },
    devServer: {
        https: DEV_CLIENT_URL.protocol === 'https:',
        host: DEV_CLIENT_URL.hostname,
        port: DEV_CLIENT_URL.port,
        disableHostCheck: true,
        contentBase: false,
        watchContentBase: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
};

if (process.env.NODE_ENV === 'development') {
    config.publicPath = `${DEV_CLIENT_URL.href}${config.publicPath.replace(/^\//, '')}`;
}

module.exports = config;
