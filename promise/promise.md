# Promise的简单实现

## Promise 基本

### 1. Promise 基本结构
```javascript
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('FULFILLED')
  }, 1000)
})
```
构造函数Promise必须接受一个函数作为参数，我们称该函数为handle，handle又包含resolve和reject两个参数，它们是两个函数。

### 2. Promise 状态和值  

Promise 对象存在以下三种状态：
+ Pending(进行中)
+ Fulfilled(已成功)
+ Rejected(已失败)

```
状态只能由 Pending 变为 Fulfilled 或由 Pending 变为 Rejected ，且状态改变之后不会在发生变化，会一直保持这个状态。
```

Promise的值是指状态改变时传递给回调函数的值
上文中handle函数包含 resolve 和 reject 两个参数，它们是两个函数，可以用于改变 Promise 的状态和传入 Promise 的值

resolve 和 reject  
+ resolve : 将Promise对象的状态从 Pending(进行中) 变为 Fulfilled(已成功)   
+ reject : 将Promise对象的状态从 Pending(进行中) 变为 Rejected(已失败)
+ resolve 和 reject 都可以传入任意类型的值作为实参，表示 Promise 对象成功（Fulfilled）和失败（Rejected）的值  

```javascript
// 判断变量否为function
const isFunction = variable => typeof variable === 'function'
// 定义Promise的三种状态常量
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise must accept a function as a parameter')
    }
    // 初始化状态和值
    this._status = PENDING
    this._value = undefined
    // 执行handle
    try {
      handle(this._resolve.bind(this), this._reject.bind(this)) 
    } catch (err) {
      this._reject(err)
    }
  }
  // 添加resovle时执行的函数
  _resolve (val) {
    if (this._status !== PENDING) return
    this._status = FULFILLED
    this._value = val
  }
  // 添加reject时执行的函数
  _reject (err) { 
    if (this._status !== PENDING) return
    this._status = REJECTED
    this._value = err
  }
}

```


### 3. Promise 的 then 方法  

Promise 对象的 then 方法接受两个参数：
```javascript
promise.then(onFulfilled, onRejected)
```
onFulfilled 和 onRejected 都是可选参数。

**onFulfilled 和 onRejected 特性**
+ 当 promise 状态变为成功时onFulfilled必须被调用，其第一个参数为 promise 成功状态传入的值（ resolve 执行时传入的值）/当 promise 状态变为失败时onRejected必须被调用，其第一个参数为 promise 失败状态传入的值（ reject 执行时传入的值）
+ 在 promise 状态改变前其不可被调用
+ 其调用次数不可超过一次  

**then 的返回**

then 方法必须返回一个新的 promise 对象
```javascript
let promise2 = promise1.then(onFulfilled1, onRejected1);
console.log(promise2) // Promise
```

因此 promise 支持链式调用
```javascript
promise1.then(onFulfilled1, onRejected1).then(onFulfilled2, onRejected2);
// promise1.then() 返回了一个promise2
// promise2.then(onFulfilled2, onRejected2)
```

promise 的链式调用涉及的执行规则，包括**值的传递**和**错误捕获**机制，分为以下几种情况：
1. 如果 onFulfilled 或者 onRejected 返回一个值 x 
+ 若 x 不为 Promise ，则使 x 直接作为新返回的 Promise 对象的值， 即新的onFulfilled 或者  onRejected 函数的参数.
+ 若 x 为 Promise ，这时后一个回调函数，就会等待该 Promise 对象(即 x )的状态发生变化，才会被调用，并且新的 Promise 状态和 x 的状态相同。

下面的例子用于帮助理解：
```javascript
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})
promise2 = promise1.then(res => {
  // 返回一个普通值
  return '这里返回一个普通值'
})
promise2.then(res => {
  console.log(res) //1秒后打印出：这里返回一个普通值
})
```

```javascript
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})
promise2 = promise1.then(res => {
  // 返回一个Promise对象
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('这里返回一个Promise')
    }, 2000)
  })
})
promise2.then(res => {
  console.log(res) //3秒后打印出：这里返回一个Promise
})
```

2. 如果 onFulfilled 或者onRejected 抛出一个异常 e ，则 promise2 必须变为失败（Rejected），并返回失败的值 e，例如：

```javascript
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
promise2 = promise1.then(res => {
  throw new Error('这里抛出一个异常e')
})
promise2.then(res => {
  console.log(res)
}, err => {
  console.log(err) //1秒后打印出：这里抛出一个异常e
})
```

3. 如果onFulfilled 不是函数且 promise1 状态为成功（Fulfilled）， promise2 必须变为成功（Fulfilled）并返回 promise1 成功的值，例如：
```javascript
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
promise2 = promise1.then('这里的onFulfilled本来是一个函数，但现在不是')
promise2.then(res => {
  console.log(res) // 1秒后打印出：success
}, err => {
  console.log(err)
})
```

4. 如果 onRejected 不是函数且 promise1 状态为失败（Rejected），promise2必须变为失败（Rejected） 并返回 promise1 失败的值，例如：
```javascript
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('fail')
  }, 1000)
})
promise2 = promise1.then(res => res, '这里的onRejected本来是一个函数，但现在不是')
promise2.then(res => {
  console.log(res)
}, err => {
  console.log(err)  // 1秒后打印出：fail
})
```

根据上面的规则，我们来为 完善 MyPromise
修改 constructor : 增加执行队列
由于 then 方法支持多次调用，我们可以维护两个数组，将每次 then 方法注册时的回调函数添加到数组中，等待执行
```javascript
constructor (handle) {
  if (!isFunction(handle)) {
    throw new Error('MyPromise must accept a function as a parameter')
  }
  // 添加状态
  this._status = PENDING
  // 添加状态
  this._value = undefined
  // 添加成功回调函数队列
  this._fulfilledQueues = []
  // 添加失败回调函数队列
  this._rejectedQueues = []
  // 执行handle
  try {
    handle(this._resolve.bind(this), this._reject.bind(this)) 
  } catch (err) {
    this._reject(err)
  }
}
```

添加then方法
首先，then 返回一个新的 Promise 对象，并且需要将回调函数加入到执行队列中
```javascript
// 添加then方法
then (onFulfilled, onRejected) {
  const { _value, _status } = this
  switch (_status) {
    // 当状态为pending时，将then方法回调函数加入执行队列等待执行
    case PENDING:
      this._fulfilledQueues.push(onFulfilled)
      this._rejectedQueues.push(onRejected)
      break
    // 当状态已经改变时，立即执行对应的回调函数
    case FULFILLED:
      onFulfilled(_value)
      break
    case REJECTED:
      onRejected(_value)
      break
  }
  // 返回一个新的Promise对象
  return new MyPromise((onFulfilledNext, onRejectedNext) => {
  })
}
```

根据上文中 then 方法的规则，我们知道返回的新的 Promise 对象的状态依赖于当前 then 方法回调函数执行的情况以及返回值
我们来进一步完善 then 方法:
```javascript
function callAsync(fn, arg, callback, onError) {
  setTimeout(() => {
    try {
      callback ? callback(fn(arg)) : fn(arg)
    } catch (e) {
      onError(e)
    }
  }, 0)
}
// 添加then方法
then(onFulfilled, onRejected) {
  // 返回一个新的Promise对象
  return new MyPromise((onFulfilledNext, onRejectedNext) => {
    // 封装一个成功时执行的函数
    let fulfilled = value => {
      if (isFunction(onFulfilled)) {
        callAsync(onFulfilled, value, res => {
          if (res instanceof MyPromise) {
            // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
            res.then(onFulfilledNext, onRejectedNext)
          } else {
            // 否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
            onFulfilledNext(res)
          }
        }, onRejectedNext)
        /* -----相当于下面的代码----- */
        setTimeout(() => {
          try {
            if (callback) {
              let res = onFulfilled(arg)
              res => {
                if (res instanceof MyPromise) {
                  // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
                  res.then(onFulfilledNext, onRejectedNext)
                } else {
                  // 否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                  onFulfilledNext(res)
                }
              }
            } else {
              onFulfilled(arg)
            }
          } catch (e) {
            onError(e)
          }
        }, 0)
        /* ----------------- */
      } else {
        try {
          // 执行下一个then里面的回调函数
          onFulfilledNext(value)
        } catch (err) {
          // 如果函数执行出错，新的Promise对象的状态为失败
          onRejectedNext(err)
        }
      }
    }
    // 封装一个失败时执行的函数
    let rejected = error => {
      if (isFunction(onRejected)) {
        callAsync(onRejected, error, res => {
          if (res instanceof MyPromise) {
            // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
            res.then(onFulfilledNext, onRejectedNext)
          } else {
            // 否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
            onFulfilledNext(res)
          }
        }, onRejectedNext)
      } else {
        try {
          onRejectedNext(error)
        } catch (err) {
          // 如果函数执行出错，新的Promise对象的状态为失败
          onRejectedNext(err)
        }
      }
    }

    switch (this._status) {
      // 当状态为pending时，将then方法回调函数加入执行队列等待执行
      case PENDING:
        this._fulfilledQueue.push(fulfilled)
        this._rejectedQueue.push(rejected)
        break
      // 当状态已经改变时，立即执行对应的回调函数
      case FULFILLED:
        fulfilled(this._value)
        break
      case REJECTED:
        rejected(this._value)
        break
    }
  })
}
```



接着修改 _resolve 和 _reject ：依次执行队列中的函数
当 resolve 或  reject 方法执行时，我们依次提取成功或失败任务队列当中的函数开始执行，并清空队列，从而实现 then 方法的多次调用，实现的代码如下：

```javascript
// 添加resovle时执行的函数
_resolve(val) {
  // 只有当状态为PENDING时才能执行此函数
  if (this._status !== PENDING) return
  this._status = FULFILLED
  // 依次执行成功队列中的函数，并清空队列
  const runFulfilled = (value) => {
    let cb;
    while (cb = this._fulfilledQueue.shift()) {
      cb(value)
    }
    /* -----相当于下面的代码----- */
    // 当this._fulfilledQueue长度大于0的时候
    while (this._fulfilledQueue.length>0) {
      // 执行队列中第一个函数，执行完后去掉
      let cb = this._fulfilledQueue[0];
      cb(value)
      this._fulfilledQueue.shift()
    }
    /* ------------------------ */
  }
  // 依次执行失败队列中的函数，并清空队列
  const runRejected = (error) => {
    let cb
    while (cb = this._rejectedQueue.shift()) {
      cb(error)
    }
  }
  /* 如果resolve的参数为Promise对象，则必须等待该Promise对象状态改变后,
    当前Promsie的状态才会改变，且状态取决于参数Promsie对象的状态
  */
  if (val instanceof MyPromise) {
    val.then(value => {
      this._value = value
      runFulfilled(value)
    }, err => {
      this._value = err
      runRejected(err)
    })
  } else {
    this._value = val
    runFulfilled(val)
  }
}
```


catch 方法
```javascript
// 添加catch方法
catch(onRejected) {
  return this.then(null, onRejected)
}
```

完整代码
```javascript
  function callAsync(fn, arg, callback, onError) {
  setTimeout(() => {
    try {
      callback ? callback(fn(arg)) : fn(arg)
    } catch (e) {
      onError(e)
    }
  }, 0)
}

  // 判断变量否为function
  const isFunction = variable => typeof variable === 'function'
  // 定义Promise的三种状态常量
  const PENDING = 'pending'
  const FULFILLED = 'fulfilled'
  const REJECTED = 'rejected'

  class MyPromise {
    constructor(handle) {
      if (!isFunction(handle)) {
        throw new Error('MyPromise must accept a function as a parameter')
      }
      // 添加状态
      this._status = PENDING
      // 添加状态
      this._value = null
      // 添加成功回调函数队列
      this._fulfilledQueue = []
      // 添加失败回调函数队列
      this._rejectedQueue = []
      // 执行handle
      try {
        handle(this._resolve.bind(this), this._reject.bind(this)) 
      } catch (err) {
        this._reject(err)
      }
    }
    // 添加resovle时执行的函数
    _resolve(val) {
      if (this._status !== PENDING) return
      this._status = FULFILLED
      // 依次执行成功队列中的函数，并清空队列
      const runFulfilled = (value) => {
        let cb;
        while (cb = this._fulfilledQueue.shift()) {
          cb(value)
        }
      }
      // 依次执行失败队列中的函数，并清空队列
      const runRejected = (error) => {
        let cb
        while (cb = this._rejectedQueue.shift()) {
          cb(error)
        }
      }
      /* 如果resolve的参数为Promise对象，则必须等待该Promise对象状态改变后,
        当前Promsie的状态才会改变，且状态取决于参数Promsie对象的状态
      */
      if (val instanceof MyPromise) {
        val.then(value => {
          this._value = value
          runFulfilled(value)
        }, err => {
          this._value = err
          runRejected(err)
        })
      } else {
        this._value = val
        runFulfilled(val)
      }
    }
    // 添加reject时执行的函数
    _reject(err) { 
      if (this._status !== PENDING) return
      // 依次执行失败队列中的函数，并清空队列
      this._status = REJECTED
      this._value = err
      let cb
      while (cb = this._rejectedQueue.shift()) {
        cb(err)
      }
    }
    // 添加then方法
    then(onFulfilled, onRejected) {
      // 返回一个新的Promise对象
      return new MyPromise((onFulfilledNext, onRejectedNext) => {
        // 封装一个成功时执行的函数
        let fulfilled = value => {
          if (isFunction(onFulfilled)) {
            callAsync(onFulfilled, value, res => {
              if (res instanceof MyPromise) {
                // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
                res.then(onFulfilledNext, onRejectedNext)
              } else {
                // 否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                onFulfilledNext(res)
              }
            }, onRejectedNext)
          } else {
            try {
              onFulfilledNext(value)
            } catch (err) {
              // 如果函数执行出错，新的Promise对象的状态为失败
              onRejectedNext(err)
            }
          }
        }
        // 封装一个失败时执行的函数
        let rejected = error => {
          if (isFunction(onRejected)) {
            callAsync(onRejected, error, res => {
              if (res instanceof MyPromise) {
                // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
                res.then(onFulfilledNext, onRejectedNext)
              } else {
                // 否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                onFulfilledNext(res)
              }
            }, onRejectedNext)
          } else {
            try {
              onRejectedNext(error)
            } catch (err) {
              // 如果函数执行出错，新的Promise对象的状态为失败
              onRejectedNext(err)
            }
          }
        }

        switch (this._status) {
          // 当状态为pending时，将then方法回调函数加入执行队列等待执行
          case PENDING:
            this._fulfilledQueue.push(fulfilled)
            this._rejectedQueue.push(rejected)
            break
          // 当状态已经改变时，立即执行对应的回调函数
          case FULFILLED:
            fulfilled(this._value)
            break
          case REJECTED:
            rejected(this._value)
            break
        }
      })
    }
    // 添加catch方法
    catch(onRejected) {
      return this.then(null, onRejected)
    }
  }

```