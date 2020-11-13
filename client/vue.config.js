module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,
  filenameHashing: false,
  pwa: {
    name: 'Robert2',
    themeColor: '#e14406',
    msTileColor: '#ffffff',
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.delete('friendly-errors');
    }
  },
};
