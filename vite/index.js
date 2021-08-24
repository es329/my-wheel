const fs = require("fs");
const path = require("path");
const Koa = require("koa");
const compilerSfc = require("@vue/compiler-sfc"); // .vue
const compilerDom = require("@vue/compiler-dom"); // 模板

// 需要改写 欺骗一下浏览器 'vue' => '/@modules/vue' => 别名
function rewriteImport(content) {
  // form 后以 ' " 开头 中间有至少一个或多个出 ' " 以外的字符 再以 ' " 结尾
  return content.replace(/ from ['|"]([^'"]+)['|"]/g, function (s0, s1) {
    // TODO s0 s1 ?
    // console.log("s", s0, s1);
    // . ../ /开头的，都是相对路径
    if (s1[0] !== '.' && s1[1] !== '/') {
      return ` from '/@modules/${s1}'`;
    } else {
      return s0;
    }
  });
}

const app = new Koa()
app.use(async (ctx) => {
  const { url, query } = ctx.request
  console.log(`url: ${url}`)
  // / => index.html
  // url为/ 读取index.html
  if (url === '/') {
    ctx.type = 'text/html'
    let content = fs.readFileSync('./index.html', 'utf-8')
    content = content.replace(
      '<script ',
      `
      <script>
        window.process = {env:{ NODE_ENV:'dev'}}
      </script>
      <script 
    `
    );
    ctx.body = content
  }

  // *.js => src/*.js
  else if (url.endsWith('.js')) {
    // /src/main.js => 代码文件所在位置/src/main.js
    // 去掉第一个字符 / 
    const p = path.resolve(__dirname, url.slice(1))
    const content = fs.readFileSync(p, 'utf-8')
    ctx.type = 'application/javascript'
    ctx.body = rewriteImport(content)
  }

  // 第三方库的支持
  // vue => /@modules/vue => node_modules/***
  else if (url.startsWith('/@modules')) {
    // 读取node_modules/vue/package.json的module属性(es模块入口)
    const prefix = path.resolve(__dirname, 'node_modules', url.replace('/@modules/', ''))
    const module = require(`${prefix}/package.json`).module
    // modeule : "dist/vue.runtime.esm-bundler.js"
    const p = path.resolve(prefix, module)
    const ret = fs.readFileSync(p, 'utf-8')
    ctx.type = 'application/javascript'
    // 保证第三方库正常加载其他的库
    ctx.body = rewriteImport(ret)
  }

  // 支持SFC组件 单文件组件
  // *.vue
  else if (url.indexOf('.vue') > -1) {
    // *.vue?type=template
    const p = path.resolve(__dirname, url.split('?')[0].slice(1))
    // 1. vue文件 => template script(compiler-sfc)
    const {descriptor} = compilerSfc.parse(fs.readFileSync(p, 'utf-8'))
    // console.log(`descriptor: ${descriptor}`)

    if (!query.type) {
      // 提取js部分 descriptor.script => js
      ctx.type = 'application/javascript'
      // 借用vue自导的compile框架 解析单文件组件，其实相当于vue-loader做的事情
      ctx.body = `
        ${rewriteImport(
          descriptor.script.content.replace("export default ", "const __script = ")
        )}
        import { render as __render } from "${url}?type=template"
        __script.render = __render
        export default __script
      `
      // 这一部分只处理js部分
      // 通过 import { render as __render } from "${url}?type=template"
      // 这一句话单独加载template部分，所以前面需要加一个if判断 是处理js还是处理template
    } else if (query.type === 'template') {
      // 2. template模板 => render函数 (compiler-dom)
      // 模板内容
      const template = descriptor.template
      // 要在server端吧compiler做了
      const render = compilerDom.compile(template.content, { mode: 'module' })
      ctx.type = 'application/javascript'
      // console.log(`render: ${render}`)

      ctx.body = rewriteImport(render.code)
    }
  }

  // 支持css
  else if (url.endsWith('.css')) {
    // css 转化为 js 代码
    // 利用js 添加一个style标签
    const p = path.resolve(__dirname, url.slice(1))
    const file = fs.readFileSync(p, 'utf-8')
    const content = `
      const css = '${file.replace(/\n/g, '')}'
      let link = document.createElement('style')
      link.setAttribute('type', 'text/css')
      document.head.appendChild(link)
      link.innerHTML = css
      export default css
    `;
    ctx.type = 'application/javascript';
    ctx.body = content;
  }

})
app.listen(3000, () => {
  console.log('Vite start at 3000')
})