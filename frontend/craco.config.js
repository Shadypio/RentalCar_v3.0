const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'development') {
        // Speed up development builds
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };

        // Reduce bundle analysis time
        webpackConfig.resolve.symlinks = false;
        
        // Speed up file system operations
        webpackConfig.snapshot = {
          managedPaths: [path.resolve(__dirname, 'node_modules')],
        };

        // Disable source maps for faster builds
        webpackConfig.devtool = false;
      }
      
      return webpackConfig;
    },
  },
  devServer: {
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
};
