// 1.导出一个模块
// 2.返回一个函数，函数接收一个函数参数，如果传递该参数执行之，同时传入hi给它
// 3.返回helloworld

// 套件
describe('test index', () => {
  // 测试用例1 验证返回值
  test('should return a hellowold string', () => {
    const hello = require('../index.js')
    const result = hello()
    expect(result).toBe('helloworld')
  })

  // 测试用例2 验证回调函数是否被调用并传入 hi 作为参数
  test('should ', () => {
    const hello = require('../index.js')
    // 模拟一个函数，可以记录这个函数有没有调用
    const fn = jest.fn()
    hello(fn)
    const calls = fn.mock.calls;
    // 验证
    // fn是否被调用了一次
    expect(calls.length).toBe(1)
    // 第一次调用的第一个参数是 'hi'
    expect(calls[0][0]).toBe('hi')

  })
  
  
})