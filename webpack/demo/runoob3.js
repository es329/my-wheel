import object from './greeter.js'
const { str, obj } = object
document.getElementById('app').innerHTML = `message from runoob3.js and ${str}`
obj.count++
console.log(`component-2: ${obj.count}`)