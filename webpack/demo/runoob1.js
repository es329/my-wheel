import './style.css'
import object from './greeter.js'
import str from './runoob2.js'

__webpack_nonce__ = 'c29tZSBjb29sIHN0cmluZyB3aWxsIHBvcCB1cCAxMjM=';

function component() {
  const element = document.createElement('div')
  element.innerHTML = str
  object.obj.count++
  console.log(`component-1: ${object.obj.count}`)

  return element
}

document.body.appendChild(component())