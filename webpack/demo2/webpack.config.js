/**创建 library 练习 */
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    library: {
      name: 'webpackNumbers',
      // 所有模块定义下暴露你的库, 允许它与 CommonJS、AMD 和作为全局变量工作
      type: 'umd',
    },
  },
  externals: {
    // 外部化 lodash
    // 通常，lodash也被打包到代码中，但是更倾向于把 lodash 当作 peerDependency，让使用者自己安装lodash
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_',
    },
  },
};