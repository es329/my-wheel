// 重构 render 函数
import typeSymbol from './type.js'

const {
  TEXT_ELEMENT,
  PLACEMENT,
  DELETION
} = typeSymbol
/**
 * element 指 React Element
 * node 指 DOM Element
 */

// 抽象出创建DOM的代码
function createDom(fiber) {
  const dom =
    fiber.type == TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key =>
  prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

function commitRoot() {
  deletions.forEach(commitWork)
  // TODO add nodes to dom
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  if (
    fiber.effectTag === PLACEMENT &&
    fiber.dom != null
  ) {
    // PLACEMENT 新建DOM
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    // 更新已经存在的旧 DOM 节点的属性值
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  }else if (fiber.effectTag === DELETION) {
    domParent.removeChild(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}


let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
// 数组去保存要移除的 dom 节点
let deletions = null

// 不仅需要执行每一小块的任务单元，还需要返回下一个任务单元。
function performUnitOfWork(fiber) {
  // console.log('fiber:',fiber)
  // TODO add dom node
  // 当 type 为 Function 时，说明是函数式组件
  const isFunctionComponent =
    fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
  // if (!fiber.dom) {
  //   fiber.dom = createDom(fiber)
  // }


  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  // TODO create new fibers
  // const elements = fiber.props.children
  // reconcileChildren(fiber, elements)
  
  // TODO return next unit of work
  // 找到下一个工作单元。先试试 child 节点，再试试 sibling 节点，再试试 “uncle” 节点。
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function updateFunctionComponent(fiber) {
  // TODO
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null
    // const newFiber = {
    //   type: element.type,
    //   props: element.props,
    //   parent: fiber,
    //   dom: null,
    // }

    // TODO compare oldFiber to element
    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    // 对于新旧节点类型是相同的情况，我们可以复用旧的 DOM，仅修改上面的属性
    if (sameType) {
      // TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    // 如果类型不同，意味着我们需要创建一个新的 DOM 节点
    if (element && !sameType) {
      // TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: PLACEMENT,
      }
    }
    // 如果类型不同，并且旧节点存在的话，需要把旧节点的 DOM 给移除
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
      oldFiber.effectTag = DELETION
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // 据是否是第一个子节点，来设置父节点的 child 属性的指向，或者上一个节点的 sibling 属性的指向。
    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  // 一旦完成了 wipRoot 这颗树上的所有任务，我们把整颗树的变更提交（commit）到实际的 DOM 上。
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

// 使用 requestIdleCallback 作为一个循环。你可以把 requestIdleCallback 类比成 setTimeout，只不过这次是浏览器来决定什么时候运行回调函数，而不是 settimeout 里通过我们指定的一个时间。浏览器会在主线程有空闲的时候运行回调函数。
// React 并不是用 requestIdleCallback 的。它使用自己编写的 scheduler package。 但两者概念上是相同的
// requestIdleCallback 给了一个 deadline 参数。我们可以通过它来判断离浏览器再次拿回控制权还有多少时间。
requestIdleCallback(workLoop)


function render(element, container) {
  // work in progress root
  wipRoot  = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

const reactDom = {
  render
}
export default reactDom