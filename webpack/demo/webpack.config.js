const { BannerPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env) => {
  console.log('Goal: ', env.goal); // 'local'
  console.log('Production: ', env.production); // true

  return {
    mode: 'development',
    entry: {
      main: __dirname + '/runoob1.js',
      other: __dirname + '/runoob3.js'
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].[contenthash].js',
      clean: true
    },
    module: {
      rules: [
        {// 配置css文件需要用到哪些loader
          test: /\.css$/i,
          use: [
            // [style-loader](/loaders/style-loader)
            { loader: 'style-loader' },
            // [css-loader](/loaders/css-loader)
            {
              loader: 'css-loader',
              options: {
                modules: true
              }
            },
          ]
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        }
      ]
    },
    // 插件
    plugins:[
      // 给生产的文件开头加注释
      new BannerPlugin('Yzc的webpack练习'),
      // 在/dist自动生成一个index.html文件，以./index.html为模板
      new HtmlWebpackPlugin({
        template: './index.html'
      }),
      // 可以将 manifest 数据提取为一个 json 文件以供使用
      new WebpackManifestPlugin({}),
      // 将 bundle 内容展示为一个便捷的、交互式、可缩放的树状图形式
      // new BundleAnalyzerPlugin()
    ],
    optimization: {
      runtimeChunk: 'single',
      moduleIds: 'deterministic',
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: 'initial',
            minChunks: 2,
            maxInitialRequests: 5, // The default limit is too small to showcase the effect
            minSize: 0 // This is example is too small to create commons chunks
          },
          vendor: {
            test: /node_modules/,
            chunks: 'initial',
            name: 'vendor',
            priority: 10,
            enforce: true
          }
        },
      }
    },
    devServer: {
      static: {
        directory: __dirname,
      },
      compress: true,
      port: 8080,
    },
  };
}