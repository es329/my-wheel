import typeSymbol from './type.js'

const {
  TEXT_ELEMENT
} = typeSymbol

/**
 * element 指 React Element
 * node 指 DOM Element
 */

function render(element, container) {
  // todo fiber 树
  // 先根据 element 中的 type 属性创建 DOM 节点，再将新节点添加到容器中。
  const dom =
    element.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.type)

  //  element 的属性赋值给 node
  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })


  // todo 递归调用会导致主线程阻塞
  // 对每一个子节点递归地做相同的处理
  element.props.children.forEach(child =>
    render(child, dom)
  )

  container.appendChild(dom)
}

const reactDom = {
  render
}
export default reactDom