const DEV_CLIENT_URL = new URL('http://0.0.0.0:8081');

const config = {
    publicPath: '/webclient/',
    runtimeCompiler: true,
    lintOnSave: false,
    productionSourceMap: false,
    filenameHashing: false,
    chainWebpack: (webpackConfig) => {
        webpackConfig.plugins.delete('html');
        webpackConfig.plugins.delete('preload');
        webpackConfig.plugins.delete('prefetch');

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
