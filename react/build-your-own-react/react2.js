/** 分别重写了 createElement 和 render 函数 */

import Didact from './didact.js'
// import ReactDOM from './reactDom.js'
import ReactDOM from './reactDom2.js'

/** @jsx Didact.createElement
 * babel 会将 JSX 转译为 JS
 * 我这里直接人工转译
 */
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )
// 把 jsx 转化成 js 如下
// const element = Didact.createElement(
//   "div",
//   { id: "foo" },
//   Didact.createElement("a", null, "bar"),
//   Didact.createElement("b")
// )

/** @jsx Didact.createElement 
 * 支持函数式组件
*/
// function App(props) {
//   return <h1>Hi {props.name}</h1>
// }
// const element = <App name="foo" />
// 把 jsx 转化成 js 如下
function App(props) {
  return Didact.createElement(
    "h1",
    null,
    "Hi ",
    props.name
  )
}
const element = Didact.createElement(App, {
  name: "foo",
})

const container = document.getElementById("root")

ReactDOM.render(element, container)