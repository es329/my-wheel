const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

// TODO 1 分析index.js import谁
function getModuleInfo(file) {
  // 读取文件
  const body = fs.readFileSync(file, 'utf-8')
  // console.log('body: ', body)

  // 分析  文本 => 对象
  // 抽象代码，去掉分隔符用对象表示
  // AST 抽象语法树
  // 转化AST语法树
  const ast = parser.parse(body, {
    sourceType: "module", //表示我们要解析的是ES模块
  })
  // console.log('ast: ', ast)

  // 分析  节点遍历  AST对象
  const deps = {}
  traverse(ast, {
    // visitor 访问者模式
    // name() {} === name: function () {}
    // 访问所有的import
    // 返回的node为AST里import的节点，即import语句
    ImportDeclaration({ node }) {
      // 遇到import
      // 比如说 src文件夹下有 a文件 b文件 a文件引入b文件只需要写相对路径 ./b.js
      // 但是这个路径对我们的index.html 入口文件来说是不对的，所以需要重新计算一个正确的路径
      const dirname = path.dirname(file);
      const abspath = ("./" + path.join(dirname, node.source.value)).replace('\\', '/')
      deps[node.source.value] = abspath;
      // console.log(`dirname: ${dirname} abspath: ${abspath}`)
    }
  })

  // ES6转成ES5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  })

  return { 
    file, // 文件名字
    deps, // import了哪些文件
    code // 文件代码 字符串
  }
}

// const info = getModuleInfo('./src/index.js')
// console.log("info:", info)

// TODO 2 getModuleInfo可以分析一个文件，现在需要递归调用自动去分析所有文件
function parseModules(file) {
  // 从入口开始
  const entry = getModuleInfo(file)
  const temp = [entry]
  const depsGraph = {}

  // 分析依赖
  getDeps(temp, entry)

  temp.forEach(({ file, deps, code}) => {
    depsGraph[file] = {
      deps,
      code
    }
  })

  return depsGraph
}

/**
* 递归分析依赖，将所有文件的分析结果push入temp
* @param {*} temp
* @param {*} { deps } 当前依赖的list
*/
function getDeps(temp, { deps }) {
  Object.keys(deps).forEach(key => {
    const child = getModuleInfo(deps[key])
    temp.push(child)
    getDeps(temp, child)
  })
}

// const deps = parseModules('./src/index.js')
// console.log('deps:', deps)

// parseModules已经可以自动分析所有文件，形成一个依赖list
// 再将执行函数和依赖结合起来
// 生成bundle文件
function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file));
  return `(function (graph) {
    function require(file) {
      function absRequire(relPath) {
        return require(graph[file].deps[relPath])
      }
      var exports = {};
      (function (require,exports,code) {
        eval(code)
      })(absRequire,exports,graph[file].code)
      return exports
    }
    require('${file}')
  })(${depsGraph})`;
}

const content = bundle('./src/index.js')
// 生成文件
!fs.existsSync("./dist") && fs.mkdirSync("./dist")
fs.writeFileSync("./dist/bundle.js", content)