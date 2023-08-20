// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )

// const element = React.createElement(
//   "div",
//   { id: "foo" },
//   React.createElement("a", null, "bar"),
//   React.createElement("b")
// )

import typeSymbol from './type.js'

const {
  TEXT_ELEMENT
} = typeSymbol

// todo 将 JSX 转译为 JS
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}

// children 数组中也可能有像 strings、numbers 这样的基本值。
function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

const Didact = {
  createElement
}

export default Didact