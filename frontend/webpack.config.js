const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;
  
  return {
    // Optimization settings
    optimization: {
      // Split chunks for better caching
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for third-party libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
          // UI components chunk
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            enforce: true,
          },
          // Analytics chunk
          analytics: {
            test: /[\\/]src[\\/]components[\\/]analytics[\\/]/,
            name: 'analytics',
            chunks: 'async',
            enforce: true,
          },
          // Swiss services chunk
          swiss: {
            test: /[\\/]src[\\/]components[\\/]swiss[\\/]/,
            name: 'swiss-services',
            chunks: 'async',
            enforce: true,
          },
          // Icons chunk
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            chunks: 'all',
            enforce: true,
          },
        },
      },
      // Minimize bundle in production
      minimize: isProduction,
      // Tree shaking
      usedExports: true,
      sideEffects: false,
    },

    // Module resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // Prefer ES modules for better tree shaking
      mainFields: ['module', 'browser', 'main'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    // Module rules
    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { modules: false }], // Keep ES modules for tree shaking
                  '@babel/preset-typescript',
                  '@babel/preset-react',
                ],
                plugins: [
                  // Dynamic imports
                  '@babel/plugin-syntax-dynamic-import',
                  // Remove unused imports
                  ['babel-plugin-transform-imports', {
                    'lucide-react': {
                      transform: 'lucide-react/dist/esm/icons/{{member}}',
                      skipDefaultConversion: true,
                    },
                  }],
                ],
              },
            },
          ],
        },
        // CSS optimization
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: isProduction ? '[hash:base64:8]' : '[name]__[local]--[hash:base64:5]',
                },
              },
            },
            'postcss-loader',
          ],
        },
        // Image optimization
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
        },
        // Font optimization
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },

    // Plugins
    plugins: [
      // Environment variables
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
      }),

      // Bundle analyzer (only in development with analyze flag)
      ...(isDevelopment && process.env.ANALYZE ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        }),
      ] : []),

      // Compression in production
      ...(isProduction ? [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        }),
      ] : []),

      // Module concatenation for smaller bundles
      ...(isProduction ? [
        new webpack.optimize.ModuleConcatenationPlugin(),
      ] : []),
    ],

    // Performance hints
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 250000, // 250kb
      maxAssetSize: 250000, // 250kb
    },

    // Development server optimization
    ...(isDevelopment && {
      devServer: {
        hot: true,
        compress: true,
        historyApiFallback: true,
      },
    }),

    // Source maps
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',

    // Cache configuration
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },

    // Experiments for modern features
    experiments: {
      // Top level await
      topLevelAwait: true,
    },
  };
};