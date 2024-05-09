'use strict';

const fs = require('node:fs');
const { defineConfig } = require('@vue/cli-service');

const THEMES_PATH = './src/themes';
const DEV_CLIENT_URL = new URL('http://0.0.0.0:8081');

const themes = fs.readdirSync(THEMES_PATH, { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((dir) => dir.name);

const addSvgSupport = (webpackConfig) => {
    const rule = webpackConfig.module.rule('svg');

    rule.delete('type');
    rule.delete('generator');

    rule
        .oneOf('inline')
        .resourceQuery(/inline/)
        .use('vue-loader')
        .loader('vue-loader')
        .end()
        .use('vue-svg-loader-2')
        .loader('vue-svg-loader-2')
        .options({ svgo: false });

    rule
        .oneOf('external')
        .use('file-loader')
        .loader('file-loader')
        .options({ name: 'img/[name].[ext]' });
};

const addYamlSupport = (webpackConfig) => {
    webpackConfig.resolve.extensions.add('.yml').add('.yaml');
    webpackConfig.module
        .rule('yaml')
        .test(/\.ya?ml?$/)
        .type('json')
        .use('yaml-loader')
        .loader('yaml-loader')
        .options({ asJSON: true });
};

const config = defineConfig({
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
    transpileDependencies: true,
    chainWebpack: (webpackConfig) => {
        addSvgSupport(webpackConfig);
        addYamlSupport(webpackConfig);

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
        allowedHosts: 'all',
        static: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
});

if (process.env.NODE_ENV === 'development') {
    config.publicPath = `${DEV_CLIENT_URL.href}${config.publicPath.replace(/^\//, '')}`;
}

module.exports = config;
