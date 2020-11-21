module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/webclient/' : '/',
  runtimeCompiler: true,
  productionSourceMap: false,
  filenameHashing: false,
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.delete('html');
      config.plugins.delete('preload');
      config.plugins.delete('prefetch');
      config.plugins.delete('friendly-errors');
    }
  },
};
