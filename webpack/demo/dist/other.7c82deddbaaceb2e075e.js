/*! Yzc的webpack练习 */
"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["other"],{

/***/ 793:
/*!********************!*\
  !*** ./runoob3.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _greeter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./greeter.js */ 693);\n\nvar str = _greeter_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].str,\n    obj = _greeter_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].obj;\ndocument.getElementById('app').innerHTML = \"message from runoob3.js and \".concat(str);\nobj.count++;\nconsole.log(\"component-2: \".concat(obj.count));\n\n//# sourceURL=webpack:///./runoob3.js?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["commons-greeter_js"], () => (__webpack_exec__(793)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);