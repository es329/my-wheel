# JSON  

## JSON.stringify
```
JSON.stringify()  方法将一个 JavaScript 对象或值转换为 JSON 字符串，如果指定了一个 replacer 函数，则可以选择性地替换值，或者指定的 replacer 是数组，则可选择性地仅包含数组指定的属性。
```
### 语法  
``` javascript
JSON.stringify(value[, replacer [, space]])
```
+ value  
  + 将要序列化成 一个 JSON 字符串的值。

+ replacer(可选)
  1. 如果该参数是一个函数，则在序列化过程中，被序列化的值的每个属性都会经过该函数的转换和处理；
  2. 如果该参数是一个数组，则只有包含在这个数组中的属性名才会被序列化到最终的 JSON 字符串中；
  3. 如果该参数为 null 或者未提供，则对象所有的属性都会被序列化。
+ space(可选)  
  1. 指定缩进用的空白字符串，用于美化输出（pretty-print）；
  2. 如果参数是个数字，它代表有多少的空格；上限为10。
  3. 该值若小于1，则意味着没有空格；
  4. 如果该参数为字符串（当字符串长度超过10个字母，取其前10个字母），该字符串将被作为空格；
  5. 如果该参数没有提供（或者为 null），将没有空格。
  
## 异常  
+ 当在循环引用时会抛出异常TypeError ("cyclic object value")（循环对象值）
+ 当尝试去转换 BigInt 类型的值会抛出TypeError ("BigInt value can't be serialized in JSON")（BigInt值不能JSON序列化）.

## 9大特性要记住
### 特性一
1. undefined、任意的函数以及symbol值，出现在非数组对象的属性值中时在序列化过程中会被忽略
2. undefined、任意的函数以及symbol值，出现在数组中时会被转换成 null。
3. undefined、任意的函数以及symbol值，被单独转换时，会返回 undefined

### 特性二
布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。  
``` javascript
console.log(JSON.stringify([new Number(1), new String("前端胖头鱼"), new Boolean(false)]))
// '[1,"前端胖头鱼",false]'
```

### 特性三  
所有以symbol为属性键的属性都会被完全忽略掉，即便 replacer 参数中强制指定包含了它们。

### 特性四  
NaN 和 Infinity 格式的数值及 null 都会被当做 null。

### 特性五  
转换值如果有 toJSON() 方法，该方法定义什么值将被序列化。
``` javascript
const toJSONObj = {
  name: '前端胖头鱼',
  toJSON () {
    return 'JSON.stringify'
  }
}

console.log(JSON.stringify(toJSONObj))
// "JSON.stringify"
```
### 特性六  
Date 日期调用了 toJSON() 将其转换为了 string 字符串（同Date.toISOString()），因此会被当做字符串处理。
### 特性七  
对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。
### 特性八  
其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性
### 特性九  
当尝试去转换 BigInt 类型的值会抛出错误

## 参考链接  
 - https://juejin.cn/post/7017588385615200270