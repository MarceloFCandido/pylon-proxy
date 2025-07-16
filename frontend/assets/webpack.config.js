const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    // Entry point for the application
    entry: './src/js/main.ts',
    
    // Output configuration
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      clean: true,
      publicPath: '/'
    },
    
    // Module resolution
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    // Development server configuration
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true
    },
    
    // Source maps for debugging
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    // Module rules
    module: {
      rules: [
        // TypeScript loader
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        // CSS loader
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer'),
                    ...(isProduction ? [require('cssnano')] : [])
                  ]
                }
              }
            }
          ]
        },
        // Asset modules for fonts and images
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        }
      ]
    },
    
    // Plugins
    plugins: [
      // HTML template
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false
      }),
      // Extract CSS in production
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css'
        })
      ] : [])
    ],
    
    // Optimizations for production
    optimization: {
      minimize: isProduction,
      minimizer: [
        // JavaScript minification with aggressive options
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 2020
            },
            compress: {
              ecma: 2020,
              comparisons: false,
              inline: 2,
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 2020,
              comments: false,
              ascii_only: true
            }
          },
          extractComments: false
        }),
        // CSS minification
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true }
              }
            ]
          }
        })
      ],
      // Code splitting configuration
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      // Runtime chunk for better caching
      runtimeChunk: 'single'
    }
  };
};
